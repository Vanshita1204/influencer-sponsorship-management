from flask_restful import Resource, Api, reqparse, fields, marshal_with, abort, request
from .models import db, Campaign, Sponsor, AdRequest, Influencer, User
from flask_security import auth_required, roles_required, roles_accepted
from flask import jsonify
from datetime import datetime
from sqlalchemy import and_, or_
from flask_security.proxies import _security
from .helpers import validate_date_fields
from .instances import cache

api = Api(prefix="/api")

campaign_parser = reqparse.RequestParser()
campaign_parser.add_argument("goals", type=str)
campaign_parser.add_argument("name", type=str)
campaign_parser.add_argument("description", type=str)
campaign_parser.add_argument("budget", type=float)
campaign_parser.add_argument("publically_visible", type=bool)
campaign_parser.add_argument("start_date", type=str)
campaign_parser.add_argument("end_date", type=str)

campaign_fields = {
    "id": fields.Integer,
    "goals": fields.String,
    "name": fields.String,
    "description": fields.String,
    "budget": fields.Float,
    "publically_visible": fields.Boolean,
    "start_date": fields.String,
    "end_date": fields.String,
    "is_verified": fields.Boolean,
}


def serialize_campaign(campaign):
    return {
        "id": campaign.id,
        "name": campaign.name,
        "description": campaign.description,
        "start_date": campaign.start_date.isoformat() if campaign.start_date else None,
        "end_date": campaign.end_date.isoformat() if campaign.end_date else None,
        "budget": campaign.budget,
        "publically_visible": campaign.publically_visible,
        "is_verified": campaign.is_verified,
        "sponsor": (
            {
                "id": campaign.sponsor.id,
                "company_name": campaign.sponsor.company_name,
                "industry": campaign.sponsor.industry,
            }
            if campaign.sponsor
            else None
        ),
        "goals": campaign.goals,
    }


class CampaignResource(Resource):

    @cache.cached(timeout=50)
    def get(self, campaign_id=None):
        token = request.headers.get("Authorization")
        user_id, role = None, None
        if token:
            fs_uniquifier = _security.remember_token_serializer.loads(token).get("uid")
            user = User.query.filter_by(fs_uniquifier=fs_uniquifier).first()
            if user:
                user_id, role = user.id, user.roles[0].name
        campaign_query = Campaign.query
        if user_id:
            if role == "admin":
                sponsor_id = request.args.get("sponsor_id")
                influencer_id = request.args.get("influencer_id")
                if sponsor_id:
                    campaign_query = campaign_query.filter(
                        Campaign.sponsor_id == sponsor_id
                    )
                if influencer_id:
                    campaign_query = campaign_query.join(AdRequest).filter(
                        AdRequest.influencer_id == influencer_id
                    )
            elif role == "sponsor":
                influencer_id = request.args.get("influencer_id")
                verified = request.args.get("verified")
                if influencer_id:
                    campaign_query = campaign_query.join(AdRequest).filter(
                        AdRequest.influencer_id == influencer_id
                    )
                if verified:
                    campaign_query = campaign_query.filter(Campaign.is_verified == True)
                campaign_query = campaign_query.filter(
                    Campaign.sponsor_id == user.sponsor[0].id
                )
            elif role == "influencer":
                campaign_query = campaign_query.outerjoin(AdRequest).filter(
                    and_(
                        Campaign.is_verified == True,
                        or_(
                            and_(
                                Campaign.publically_visible == True,
                                Campaign.end_date >= datetime.now(),
                            ),
                            AdRequest.influencer_id == user.influencer[0].id,
                        ),
                    )
                )
            else:
                campaign_query = campaign_query.filter(
                    Campaign.publically_visible == True
                )
        if campaign_id:
            campaign_query = campaign_query.filter(Campaign.id == campaign_id)
        campaigns = campaign_query.all()

        if not campaigns:
            abort(404, message="No resource")
        serialized_campaigns = [serialize_campaign(campaign) for campaign in campaigns]
        return serialized_campaigns

    @auth_required("token")
    @roles_required("sponsor")
    def post(self):
        args = campaign_parser.parse_args()
        token = request.headers.get("Authorization")
        fs_uniquifier = _security.remember_token_serializer.loads(token).get("uid")
        user = User.query.filter_by(fs_uniquifier=fs_uniquifier).first()
        if user.active == False:
            return abort(401, message="User unverified")
        success, error = validate_date_fields(args["start_date"], args["end_date"])
        if not success:
            return abort(400, message=error)

        args["start_date"] = args.get("start_date") and datetime.fromisoformat(
            args["start_date"]
        )
        args["end_date"] = args.get("end_date") and datetime.fromisoformat(
            args["end_date"]
        )
        campaign = Campaign(
            **args, sponsor_id=user.sponsor[0].id, created_at=datetime.now()
        )
        db.session.add(campaign)
        db.session.commit()
        breakpoint
        return {"message": "Campaign created"}, 201

    @marshal_with(campaign_fields)
    @auth_required("token")
    @roles_required("sponsor")
    def put(self, campaign_id):
        args = campaign_parser.parse_args()
        token = request.headers.get("Authorization")
        fs_uniquifier = _security.remember_token_serializer.loads(token).get("uid")
        user = User.query.filter_by(fs_uniquifier=fs_uniquifier).first()
        campaign = Campaign.query.filter(
            and_(Campaign.sponsor_id == user.sponsor[0].id, Campaign.id == campaign_id)
        ).all()

        if not campaign:
            abort(404, message="No resource")
        campaign = campaign[0]
        updated_fields = []
        for arg, value in args.items():
            if value != None:
                if arg in ["start_date", "end_date"]:
                    value = datetime.fromisoformat(value)
                setattr(campaign, arg, value)
                updated_fields.append(arg)
        if set(["start_date", "end_date"]).intersection(set(updated_fields)):
            success, error = validate_date_fields(
                campaign.start_date, campaign.end_date
            )
            if not success:
                return abort(400, message=error)
        db.session.commit()
        return campaign


api.add_resource(
    CampaignResource,
    "/campaign",
    "/campaign/<int:campaign_id>",
    endpoint="campaign",
)

ad_request_parser = reqparse.RequestParser()
ad_request_parser.add_argument("campaign_id", type=int)
ad_request_parser.add_argument("influencer_id", type=int)
ad_request_parser.add_argument("messages", type=str)
ad_request_parser.add_argument("amount", type=float)
ad_request_parser.add_argument("amount_offered", type=float)
ad_request_parser.add_argument("amount_requested", type=float)
ad_request_parser.add_argument("requirements", type=str)
ad_request_parser.add_argument("status", type=str)
ad_request_parser.add_argument("is_viewed", type=bool)

ad_request_fields = {
    "id": fields.Integer,
    "campaign_id": fields.Integer,
    "influencer_id": fields.Integer,
    "messages": fields.String,
    "amount_requested": fields.Float,
    "amount_offered": fields.Float,
    "requirements": fields.String,
    "final_amount": fields.Float,
    "status": fields.String,
    "requested_by": fields.String,
    "is_viewed": fields.Boolean,
    "influencer_name": fields.String,
    "influencer_handle": fields.String,
    "campaign_name": fields.String,
    "sponsor_name": fields.String,
}


class AdRequestResource(Resource):
    @auth_required("token")
    @marshal_with(ad_request_fields)
    @cache.cached(timeout=50)
    def get(self, ad_request_id=None):
        ad_request_query = AdRequest.query.join(Campaign)
        token = request.headers.get("Authorization")
        fs_uniquifier = _security.remember_token_serializer.loads(token).get("uid")
        user = User.query.filter_by(fs_uniquifier=fs_uniquifier).first()
        role = user.roles[0]
        if role == "admin":
            sponsor_id = request.args.get("sponsor_id")
            influencer_id = request.args.get("influencer_id")
            if sponsor_id:
                ad_request_query = ad_request_query.filter(
                    Campaign.sponsor_id == sponsor_id
                )
            if influencer_id:
                ad_request_query = ad_request_query.filter(
                    AdRequest.influencer_id == influencer_id
                )
        elif role == "sponsor":
            ad_request_query = ad_request_query.filter(
                Campaign.sponsor_id == user.sponsor[0].id
            )
        else:
            ad_request_query = ad_request_query.filter(
                and_(
                    AdRequest.influencer_id == user.influencer[0].id,
                    Campaign.is_verified == True,
                )
            )
        if ad_request_id:
            ad_request_query = ad_request_query.filter(AdRequest.id == ad_request_id)
        ad_requests = ad_request_query.all()
        for ad_request in ad_requests:
            ad_request.status = AdRequest.Status(ad_request.status).name.title()
            ad_request.requested_by = AdRequest.RequestedBy(
                ad_request.requested_by
            ).name.lower()
            ad_request.campaign_name = ad_request.campaign.name
            ad_request.influencer_name = ad_request.influencer.name
            ad_request.influencer_handle = ad_request.influencer.handle
            ad_request.sponsor_name = ad_request.campaign.sponsor.company_name
        if not ad_requests:
            abort(404, message="No resource")
        return ad_requests

    @auth_required("token")
    @roles_accepted("sponsor", "influencer")
    def post(self):
        args = ad_request_parser.parse_args()
        token = request.headers.get("Authorization")
        fs_uniquifier = _security.remember_token_serializer.loads(token).get("uid")
        user = User.query.filter_by(fs_uniquifier=fs_uniquifier).first()
        if user.roles[0] == "influencer":
            campaign = Campaign.query.get(args["campaign_id"])
            if not campaign or (
                campaign
                and (
                    campaign.publically_visible == False
                    or campaign.is_verified == False
                )
            ):
                return jsonify({"message": "Campaign not found"}), 404
            ad_request = AdRequest(
                campaign_id=args["campaign_id"],
                influencer_id=user.influencer[0].id,
                requested_by=AdRequest.RequestedBy.INFLUENCER.value,
                amount_requested=args["amount"],
                messages=args.get("messages"),
                status=AdRequest.Status.PENDING.value,
                is_viewed=False,
                created_at=datetime.now(),
            )
        else:
            ad_request = AdRequest(
                campaign_id=args["campaign_id"],
                influencer_id=args["influencer_id"],
                requested_by=AdRequest.RequestedBy.SPONSOR.value,
                amount_offered=args["amount"],
                messages=args.get("messages"),
                requirements=args.get("requirements"),
                status=AdRequest.Status.PENDING.value,
                is_viewed=False,
                created_at=datetime.now(),
            )
        db.session.add(ad_request)
        db.session.commit()
        return {"message": "Ad request created"}, 201

    @marshal_with(ad_request_fields)
    @auth_required("token")
    @roles_accepted("sponsor", "influencer")
    def put(self, ad_request_id):
        args = ad_request_parser.parse_args()
        token = request.headers.get("Authorization")
        fs_uniquifier = _security.remember_token_serializer.loads(token).get("uid")
        user = User.query.filter_by(fs_uniquifier=fs_uniquifier).first()
        ad_request_query = AdRequest.query.join(Campaign).filter(
            Campaign.is_verified == True
        )
        if args.get("status"):
            if args["status"] == "accepted":
                args["status"] = AdRequest.Status.ACCEPTED.value
            else:
                args["status"] = AdRequest.Status.REJECTED.value

        if user.roles[0] == "influencer":
            ad_request = ad_request_query.filter(
                and_(
                    AdRequest.influencer_id == user.influencer[0].id,
                    AdRequest.id == ad_request_id,
                )
            ).all()
            if not ad_request:
                return jsonify({"message": "AdRequest not found"}), 404
            ad_request = ad_request[0]
            if args.get("status"):
                ad_request.status = args["status"]
            if ad_request.status == AdRequest.Status.PENDING.value and args.get(
                "amount_requested"
            ):
                ad_request.amount_requested = args["amount_requested"]
            if ad_request.status == AdRequest.Status.ACCEPTED.value:
                if ad_request.amount_offered != ad_request.amount_requested:
                    return abort(
                        400,
                        message="Cannot accept till amount requested is same as amount offered",
                    )
                ad_request.final_amount = ad_request.amount_offered
        else:
            ad_request = ad_request_query.filter(
                and_(
                    Campaign.sponsor_id == user.sponsor[0].id,
                    AdRequest.id == ad_request_id,
                )
            ).all()
            if not ad_request:
                return jsonify({"message": "AdRequest not found"}), 404
            ad_request = ad_request[0]
            if args.get("status"):
                ad_request.status = args["status"]
            if ad_request.status == AdRequest.Status.PENDING.value and args.get(
                "amount_offered"
            ):
                ad_request.amount_offered = args["amount_offered"]
            if ad_request.status == AdRequest.Status.ACCEPTED.value:
                if ad_request.amount_offered != ad_request.amount_requested:
                    return abort(
                        400,
                        message="Cannot accept till amount requested is same as amount offered",
                    )
                ad_request.final_amount = ad_request.amount_requested
        if args.get("is_viewed"):
            ad_request.is_viewed = True
        db.session.commit()
        return ad_request


api.add_resource(
    AdRequestResource,
    "/ad-request",
    "/ad-request/<int:ad_request_id>",
    endpoint="ad-request",
)
