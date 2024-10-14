from celery import shared_task
from .models import AdRequest, Campaign, User, db
from sqlalchemy import and_
import flask_excel as excel
from flask_security.proxies import _security
from flask_restful import abort
from .mail_service import send_message
from jinja2 import Template
import os
import datetime
from .helpers import (
    get_platform_statistics,
    get_influencer_statistics,
    get_sponsor_statistics,
)


@shared_task(ignore_result=False)
def download_ad_request_csv(token, request_args):
    if not token:
        return
    ad_request_query = AdRequest.query.join(Campaign)
    ad_request_id = request_args.get("ad_request_id")
    fs_uniquifier = _security.remember_token_serializer.loads(token).get("uid")
    user = User.query.filter_by(fs_uniquifier=fs_uniquifier).first()
    role = user.roles[0]
    if role == "admin":
        sponsor_id = request_args.get("sponsor_id")
        influencer_id = request_args.get("influencer_id")
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
    ad_requests = AdRequest.query.all()
    csv_output = excel.make_response_from_query_sets(
        ad_requests,
        [
            "id",
            "campaign_id",
            "campaign_name",
            "influencer_name",
            "influencer_handle",
            "influencer_id",
            "sponsor_name",
            "messages",
            "amount_requested",
            "amount_offered",
            "requirements",
            "final_amount",
            "status",
            "requested_by",
            "is_viewed",
            "created_at",
        ],
        file_name="output.csv",
        file_type="csv",
    )
    filename = "test.csv"

    with open(filename, "wb") as f:
        f.write(csv_output.data)

    return filename


@shared_task(ignore_result=True)
def daily_reminder(subject="Pending Ad Requests Reminder"):
    pending_ad_requests = AdRequest.query.filter(
        AdRequest.status == AdRequest.Status.PENDING.value
    ).all()

    user_pending_count = {}

    for ad_request in pending_ad_requests:
        sponsor = ad_request.campaign.sponsor
        if sponsor not in user_pending_count:
            user_pending_count[sponsor.user_id] = 0
        user_pending_count[sponsor.user_id] += 1

        influencer = ad_request.influencer
        if influencer not in user_pending_count:
            user_pending_count[influencer.user_id] = 0
        user_pending_count[influencer.user_id] += 1

    user_ids = list(user_pending_count.keys())
    users = User.query.filter(User.id.in_(user_ids)).all()

    # Create email mapping
    user_mapping = {user.id: user for user in users}
    base_dir = os.path.dirname(os.path.abspath(__file__))
    template_path = os.path.join(base_dir, "ad_request.html")

    with open(template_path, "r") as f:
        template = Template(f.read())

        for user_id, pending_count in user_pending_count.items():
            send_message(
                user_mapping[user_id].email,
                subject,
                template.render(
                    username=user_mapping[user_id].username, number=pending_count
                ),
            )
    return "OK"


@shared_task(ignore_result=True)
def signupMail(user_id):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    template_path = os.path.join(base_dir, "welcome.html")
    user = User.query.get(user_id)
    with open(template_path, "r") as f:
        template = Template(f.read())
        send_message(
            user.email,
            "Welcome to our platform",
            template.render(username=user.username),
        )
    return "OK"


@shared_task(ignore_result=True)
def activation(user_id):
    user = User.query.get(user_id)
    base_dir = os.path.dirname(os.path.abspath(__file__))
    template_path = os.path.join(base_dir, "activation.html")
    with open(template_path, "r") as f:
        template = Template(f.read())
        send_message(
            user.email,
            "Account Activation",
            template.render(username=user.username),
        )
    return "OK"


@shared_task(ignore_result=True)
def reject_expired_ad_requests():
    today = datetime.datetime.utcnow().now()

    # Fetch all pending ad requests
    pending_ad_requests = AdRequest.query.filter(
        AdRequest.status == AdRequest.Status.PENDING.value
    ).all()

    for ad_request in pending_ad_requests:
        campaign = ad_request.campaign
        if campaign.end_date < today:
            ad_request.status = AdRequest.Status.REJECTED.value
            db.session.commit()

    return "Expired ad requests rejected"


@shared_task(ignore_result=True)
def monthly_report():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    template_path = os.path.join(base_dir, "statistics.html")
    users = User.query.all()
    with open(template_path, "r") as f:
        template = Template(f.read())
        for user in users:
            if user.roles[0] == "admin":
                data = {
                    "source": "platform",
                    "platform_statistics": get_platform_statistics(),
                }
            elif user.roles[0] == "sponsor":
                data = {
                    "source": "sponsor",
                    "sponsor_statistics": get_sponsor_statistics(
                        sponsor_id=user.sponsor[0].id
                    ),
                }
            else:
                data = {
                    "source": "influnecer",
                    "influencer_statistics": get_influencer_statistics(
                        influencer_id=user.influencer[0].id
                    ),
                }

            send_message(
                user.email,
                "Monthly Report",
                template.render(**data),
            )
