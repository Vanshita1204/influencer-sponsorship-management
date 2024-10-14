from flask import current_app as app, jsonify, request, render_template, send_file
from flask_security import auth_required, roles_required, roles_accepted
from .models import User, db, Influencer, Sponsor, Campaign, AdRequest
from .sec import datastore
from flask_restful import marshal_with, fields, abort
from datetime import datetime
from werkzeug.security import (
    check_password_hash,
    generate_password_hash as hash_password,
)
from celery.result import AsyncResult
from flask_security.proxies import _security
from .helpers import (
    get_influencer_statistics,
    get_platform_statistics,
    get_sponsor_statistics,
)
from .tasks import download_ad_request_csv, signupMail, activation
from .instances import cache

user_fields = {
    "id": fields.Integer,
    "username": fields.String,
    "role": fields.String,
    "email": fields.String,
    "last_login": fields.DateTime,
    "active": fields.Boolean,
}


@app.get("/")
def home():
    return render_template("index.html")


@app.post("/signup")
def signup():
    try:
        data = request.get_json()
        email = data.get("email")
        username = data.get("name")
        if not datastore.find_user(email=email):
            datastore.create_user(
                email=email,
                password=hash_password(data.get("password")),
                roles=[data.get("role")],
                active=False,
                username=username,
                created_at=datetime.now(),
            )
        else:
            return jsonify({"message": "User Already Exists"}), 400

        user = datastore.find_user(email=email)
        if "influencer" in user.roles:
            influencer = Influencer(
                name=data.get("name"),
                handle=data.get("handle"),
                category=data.get("category"),
                followers=data.get("followers"),
                niche=data.get("niche"),
                user_id=user.id,
            )
            db.session.add(influencer)

        if "sponsor" in user.roles:
            sponsor = Sponsor(
                company_name=data.get("company_name"),
                industry=data.get("industry"),
                budget=data.get("budget"),
                user_id=user.id,
            )
            db.session.add(sponsor)

        db.session.commit()
        signupMail.delay(user.id)
    except Exception as e:
        db.session.rollback()
        print(f"Exception: {e}")
        return "An error occurred", 400
    return {"message": f"Welcome {username}"}, 201


@app.post("/user-login")
def user_login():
    data = request.get_json()
    email = data.get("email")
    if not email:
        return jsonify({"message": "Email not provided"}), 400
    user = datastore.find_user(email=email)

    if not user:
        return jsonify({"message": "User Not Found"}), 404

    if check_password_hash(user.password, data.get("password")):
        user.last_login = datetime.now()
        db.session.commit()

        return jsonify(
            {
                "token": user.get_auth_token(),
                "email": user.email,
                "role": user.roles[0].name,
            }
        )
    else:
        return jsonify({"message": "Wrong Password"}), 400


@cache.cached(timeout=50)
@app.get("/admin/users")
@auth_required("token")
@roles_required("admin")
@marshal_with(user_fields)
def get_users():
    users = User.query.all()
    for user in users:
        user.role = user.roles[0].name
    return users


@app.get("/admin/user/<int:user_id>")
@auth_required("token")
@roles_accepted("admin", "sponsor")
def get_user(user_id):
    user = User.query.get(user_id)
    user_data = {
        "name": user.username,
        "email": user.email,
        "role": user.roles[0].name,
        "active": user.active,
        "last_login": user.last_login,
    }
    if user.roles[0] == "sponsor":
        token = request.headers.get("Authorization")
        fs_uniquifier = _security.remember_token_serializer.loads(token).get("uid")
        request_user = User.query.filter_by(fs_uniquifier=fs_uniquifier).first()
        if request_user.roles[0] != "admin":
            abort(403, "You do not have permission to access this resource.")
        user_data["sponsor_id"] = user.sponsor[0].id
        user_data["company_name"] = user.sponsor[0].company_name
        user_data["budget"] = user.sponsor[0].budget
        user_data["industry"] = user.sponsor[0].industry
    else:
        user_data["influencer_id"] = user.influencer[0].id
        user_data["handle"] = user.influencer[0].handle
        user_data["niche"] = user.influencer[0].niche
        user_data["followers"] = user.influencer[0].followers
        user_data["category"] = (
            user.influencer[0].category
            and Influencer.Category(user.influencer[0].category).name.title()
        )
    return jsonify(user_data), 200


@app.put("/activate/user/<int:user_id>")
@auth_required("token")
@roles_required("admin")
def activate_user(user_id):

    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    user.active = True
    db.session.commit()
    activation.delay(user.id)
    return {"message": "User activated"}, 200


@app.put("/deactivate/user/<int:user_id>")
@auth_required("token")
@roles_required("admin")
def deactivate_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    user.active = False
    db.session.commit()
    return {"message": "User deactive"}, 200


@app.put("/verify/campaign/<int:campaign_id>")
@auth_required("token")
@roles_required("admin")
def verify_campaign(campaign_id):
    user = Campaign.query.get(campaign_id)
    if not user:
        return jsonify({"message": "Campaign not found"}), 404
    user.is_verified = True
    db.session.commit()
    return {"message": "Campaign verified"}, 200


@app.put("/un-verify/campaign/<int:campaign_id>")
@auth_required("token")
@roles_required("admin")
def unverify_campaign(campaign_id):
    user = Campaign.query.get(campaign_id)
    if not user:
        return jsonify({"message": "Campaign not found"}), 404
    user.is_verified = False
    db.session.commit()
    return {"message": "Campaign unverified"}, 200


@app.get("/statistics")
@auth_required("token")
def get_statistics():
    token = request.headers.get("Authorization")
    fs_uniquifier = _security.remember_token_serializer.loads(token).get("uid")
    user = User.query.filter_by(fs_uniquifier=fs_uniquifier).first()
    role = user.roles[0]
    data = {}
    if role == "admin":
        sponsor_id = request.args.get("sponsor_id")
        influencer_id = request.args.get("influencer_id")
        if sponsor_id:
            data["source"] = "sponsor"
            data["statistics"] = get_sponsor_statistics(sponsor_id=sponsor_id)
        elif influencer_id:
            data["source"] = "influencer"
            data["statistics"] = get_influencer_statistics(influencer_id=influencer_id)
        else:
            data["source"] = "platform"
            data["statistics"] = get_platform_statistics()

    elif role == "sponsor":
        influencer_id = request.args.get("influencer_id")
        if influencer_id:
            data["source"] = "influencer"
            data["statistics"] = get_influencer_statistics(influencer_id=influencer_id)
        else:
            data["source"] = "sponsor"
            data["statistics"] = get_sponsor_statistics(sponsor_id=user.sponsor[0].id)
    else:
        data["source"] = "influencer"
        data["statistics"] = get_influencer_statistics(
            influencer_id=user.influencer[0].id
        )
    return jsonify(data), 200


influencer_fields = {
    "id": fields.Integer,
    "name": fields.String,
    "handle": fields.String,
    "category": fields.String,
    "followers": fields.Integer,
    "user_id": fields.Integer,
    "niche": fields.String,
}


@app.get("/influencers")
@auth_required("token")
@roles_accepted("sponsor", "admin")
@marshal_with(influencer_fields)
def get_influencers():
    influencers = Influencer.query.join(User).filter(User.active == True).all()

    for influencer in influencers:
        influencer.category = Influencer.Category(influencer.category).name

    return influencers if influencers else []


@app.get("/download-csv")
@auth_required("token")
def download_csv():
    task = download_ad_request_csv.delay(
        token=request.headers.get("Authorization"), request_args=request.args
    )
    return jsonify({"task-id": task.id})


@app.get("/get-csv/<task_id>")
@auth_required("token")
def get_csv(task_id):
    res = AsyncResult(task_id)
    if res.ready():
        filename = res.result
        return send_file(filename, as_attachment=True)
    else:
        return jsonify({"message": "Task Pending"}), 404


if __name__ == "__main__":
    app.run(debug=True)
