from .models import AdRequest, Campaign, Influencer, Sponsor, User, db


from sqlalchemy.sql import func
from datetime import datetime


def get_sponsor_statistics(sponsor_id):
    sponsor = Sponsor.query.get(sponsor_id)
    if not sponsor:
        return None
    total_campaigns = Campaign.query.filter_by(sponsor_id=sponsor_id).count()
    total_budget_utilized = (
        db.session.query(func.sum(Campaign.budget))
        .filter(Campaign.sponsor_id == sponsor_id)
        .scalar()
    )
    ad_requests = (
        db.session.query(AdRequest)
        .join(Campaign)
        .filter(Campaign.sponsor_id == sponsor_id)
        .all()
    )
    total_ad_requests = len(ad_requests)
    accepted_ad_requests = len(
        [req for req in ad_requests if req.status == AdRequest.Status.ACCEPTED.value]
    )
    rejected_ad_requests = len(
        [req for req in ad_requests if req.status == AdRequest.Status.REJECTED.value]
    )
    total_amount_spent = (
        db.session.query(func.sum(AdRequest.final_amount))
        .join(Campaign)
        .filter(Campaign.sponsor_id == sponsor_id)
        .scalar()
    )
    average_amount_offered = (
        db.session.query(func.avg(AdRequest.amount_offered))
        .join(Campaign)
        .filter(Campaign.sponsor_id == sponsor_id)
        .scalar()
    )

    return {
        "total_campaigns": total_campaigns,
        "total_budget_utilized": total_budget_utilized,
        "total_ad_requests_received": total_ad_requests,
        "accepted_ad_requests": accepted_ad_requests,
        "rejected_ad_requests": rejected_ad_requests,
        "average_amount_offered": average_amount_offered,
        "total_amount_spent": total_amount_spent,
    }


def get_influencer_statistics(influencer_id):
    influencer = Influencer.query.get(influencer_id)
    if not influencer:
        return None

    ad_requests = AdRequest.query.filter_by(influencer_id=influencer_id).all()
    total_campaigns = len(set(req.campaign_id for req in ad_requests))
    total_earnings = (
        db.session.query(func.sum(AdRequest.final_amount))
        .filter_by(influencer_id=influencer_id)
        .scalar()
    )
    total_ad_requests = len(ad_requests)
    accepted_ad_requests = len(
        [req for req in ad_requests if req.status == AdRequest.Status.ACCEPTED.value]
    )
    rejected_ad_requests = len(
        [req for req in ad_requests if req.status == AdRequest.Status.REJECTED.value]
    )
    average_amount_requested = (
        db.session.query(func.avg(AdRequest.amount_requested))
        .filter_by(influencer_id=influencer_id)
        .scalar()
    )
    average_amount_offered = (
        db.session.query(func.avg(AdRequest.amount_offered))
        .filter_by(influencer_id=influencer_id)
        .scalar()
    )
    campaign_success_rate = (
        (accepted_ad_requests / total_ad_requests) * 100 if total_ad_requests else 0
    )

    return {
        "total_campaigns_participated": total_campaigns,
        "total_earnings": total_earnings,
        "campaign_success_rate": campaign_success_rate,
        "total_ad_requests": total_ad_requests,
        "accepted_ad_requests": accepted_ad_requests,
        "rejected_ad_requests": rejected_ad_requests,
        "average_amount_requested": average_amount_requested,
        "average_amount_offered": average_amount_offered,
    }


def get_platform_statistics():
    total_users = User.query.count()
    total_influencers = Influencer.query.count()
    total_sponsors = Sponsor.query.count()
    total_campaigns = Campaign.query.count()
    total_ad_requests = AdRequest.query.count()
    average_campaign_duration = db.session.query(
        func.avg(
            func.julianday(Campaign.end_date) - func.julianday(Campaign.start_date)
        )
    ).scalar()
    monthly_active_users = (
        db.session.query(func.count(User.id))
        .filter(User.last_login >= func.date("now", "-1 month"))
        .scalar()
    )
    campaign_verification_rate = (
        (Campaign.query.filter_by(is_verified=True).count() / total_campaigns) * 100
        if total_campaigns
        else 0
    )
    ad_request_acceptance_rate = (
        (
            AdRequest.query.filter_by(status=AdRequest.Status.ACCEPTED.value).count()
            / total_ad_requests
        )
        * 100
        if total_ad_requests
        else 0
    )

    users_last_month = (
        db.session.query(func.count(User.id))
        .filter(User.created_at >= func.date("now", "-1 month"))
        .scalar()
    )
    growth_rate = (
        (users_last_month / (total_users - users_last_month)) * 100
        if (total_users - users_last_month)
        else 0
    )

    return {
        "total_users": total_users,
        "total_influencers": total_influencers,
        "total_sponsors": total_sponsors,
        "total_campaigns": total_campaigns,
        "total_ad_requests": total_ad_requests,
        "average_campaign_duration": average_campaign_duration,
        "monthly_active_users": monthly_active_users,
        "campaign_verification_rate": campaign_verification_rate,
        "ad_request_acceptance_rate": ad_request_acceptance_rate,
        "growth_rate": growth_rate,
    }


def validate_date_fields(start_date, end_date):
    if not (start_date and end_date):
        return False, "Start time and end time are required."
    if isinstance(start_date, str):
        start_date = datetime.fromisoformat(start_date)
    if isinstance(end_date, str):
        end_date = datetime.fromisoformat(end_date)
    if start_date > end_date:
        return False, "Start date cannot be after end date."
    if end_date < datetime.now():
        return False, "End date should be after today."
    if start_date < datetime.now():
        return False, "Start date cannot be before today."
    return True, "verified"
