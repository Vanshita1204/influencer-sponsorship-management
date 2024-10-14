from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin
import enum


db = SQLAlchemy()


class RolesUsers(db.Model):
    __tablename__ = "roles_users"
    id = db.Column(db.Integer(), primary_key=True)
    user_id = db.Column("user_id", db.Integer(), db.ForeignKey("user.id"))
    role_id = db.Column("role_id", db.Integer(), db.ForeignKey("role.id"))


class Role(db.Model, RoleMixin):
    __tablename__ = "role"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String, unique=True)
    description = db.Column(db.Text)


class User(db.Model, UserMixin):
    __tablename__ = "user"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String, unique=False)
    email = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String(255))
    active = db.Column(db.Boolean(), default=True)
    last_login = db.Column(db.DateTime, nullable=True)
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    roles = db.relationship(
        "Role", secondary="roles_users", backref=db.backref("users", lazy="dynamic")
    )
    influencer = db.relationship("Influencer", backref="influencer", lazy=True)
    sponsor = db.relationship("Sponsor", backref="sponsor", lazy=True)
    created_at = db.Column(db.DateTime, nullable=False)

    def __repr__(self):
        return "<User %r>" % self.username


class Influencer(db.Model):

    class Category(enum.Enum):
        NANO = 1
        MINI = 2
        MICRO = 3
        MACRO = 4
        MEGA = 5

    __tablename__ = "influencer"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(60))
    handle = db.Column(db.String(60), nullable=False)
    category = db.Column(db.Integer, nullable=False)
    followers = db.Column(db.Integer)
    niche = db.Column(db.String, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    ad_request = db.relationship("AdRequest", backref="ad_request", lazy=True)


class Sponsor(db.Model):
    __tablename__ = "sponsor"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    company_name = db.Column(db.String(60))
    industry = db.Column(db.String(60))
    budget = db.Column(db.Float)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    campaign = db.relationship("Campaign", backref="campaign", lazy=True)


class Campaign(db.Model):
    __tablename__ = "campaign"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(60))
    description = db.Column(db.Text)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    budget = db.Column(db.Float)
    publically_visible = db.Column(db.Boolean, default=False)
    goals = db.Column(db.Text)
    sponsor_id = db.Column(db.Integer, db.ForeignKey("sponsor.id"), nullable=False)
    is_verified = db.Column(db.Boolean, default=True)
    ad_request = db.relationship("AdRequest", backref="adrequest", lazy=True)
    sponsor = db.relationship("Sponsor", viewonly=True)
    created_at = db.Column(db.DateTime, nullable=False)


class AdRequest(db.Model):
    class Status(enum.Enum):
        PENDING = 1
        ACCEPTED = 2
        REJECTED = 3

    class RequestedBy(enum.Enum):
        SPONSOR = 1
        INFLUENCER = 2

    __tablename__ = "ad_request"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey("campaign.id"), nullable=False)
    influencer_id = db.Column(
        db.Integer, db.ForeignKey("influencer.id"), nullable=False
    )
    messages = db.Column(db.Text)
    amount_requested = db.Column(db.Float)
    amount_offered = db.Column(db.Float)
    requirements = db.Column(db.Text)
    final_amount = db.Column(db.Float)
    status = db.Column(db.Integer, default=Status.PENDING, nullable=False)
    requested_by = db.Column(db.Integer, nullable=False)
    is_viewed = db.Column(db.Boolean, default=False)
    campaign = db.relationship("Campaign", viewonly=True)
    influencer = db.relationship("Influencer", viewonly=True)
    created_at = db.Column(db.DateTime, nullable=False)
