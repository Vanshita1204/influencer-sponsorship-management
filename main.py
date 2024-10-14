from flask import Flask
from application.models import db
from flask_security import Security
from config import DevelopmentConfig
from application.resources import api
from application.sec import datastore
from application.worker import celery_init_app
import flask_excel as excel
from celery.schedules import crontab
from application.tasks import daily_reminder, reject_expired_ad_requests, monthly_report
from application.instances import cache


def create_app():
    app = Flask(__name__)
    app.config.from_object(DevelopmentConfig)
    db.init_app(app)
    api.init_app(app)
    excel.init_excel(app)
    app.security = Security(app, datastore=datastore)
    cache.init_app(app)

    with app.app_context():
        import application.views

    return app, datastore


app, datastore = create_app()
celery_app = celery_init_app(app)

if __name__ == "__main__":
    app.run(debug=True)


@celery_app.on_after_configure.connect
def send_daily_mails(sender, **kwargs):
    sender.add_periodic_task(
        crontab(hour=12, minute=0),
        daily_reminder.s(),
    )
    sender.add_periodic_task(
        crontab(hour=0, minute=0),
        reject_expired_ad_requests.s(),
    )
    sender.add_periodic_task(
        crontab(hour=12, minute=00, day_of_month=1),
        monthly_report.s(),
    )
