from datetime import datetime
from configs import db

class User(db.Model):
  id = db.Column(db.Integer, primary_key=True, nullable=False, unique=True)
  email = db.Column(db.String(100), nullable=False, unique=True)
  provider = db.Column(db.String(50), nullable=False)
  password = db.Column(db.String(255), nullable=True)
  first_name = db.Column(db.String(50), nullable=False)
  last_name = db.Column(db.String(50), nullable=False)
  created_at = db.Column(db.DateTime, default=datetime.now())

  def __repr__(self):
    return f"User(email={self.email}, password={self.password}, first_name={self.first_name},last_name={self.last_name})"