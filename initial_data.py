from main import app, datastore
from application.models import db
import logging
from werkzeug.security import generate_password_hash as hash_password
from datetime import datetime

# Configure logging to see SQLAlchemy's output
logging.basicConfig()
logging.getLogger("sqlalchemy.engine").setLevel(logging.INFO)

try:
    with app.app_context():
        db.create_all()
        datastore.find_or_create_role(name="admin", description="User is admin")
        datastore.find_or_create_role(
            name="influencer", description="User is influencer"
        )
        datastore.find_or_create_role(name="sponsor", description="User is sponsor")
        db.session.commit()
        if not datastore.find_user(email="admin@gmail.com"):
            datastore.create_user(
                email="admin@gmail.com",
                password=hash_password("admin"),
                roles=["admin"],
                active=True,
                created_at=datetime.now(),
            )
        db.session.commit()

except Exception as e:
    print(f"Error creating tables: {str(e)}")
