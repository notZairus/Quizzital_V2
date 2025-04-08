from datetime import datetime
from configs import db
from .classroom_user_tbl import classroom_user_tbl

class User(db.Model):
  id = db.Column(db.Integer, primary_key=True, nullable=False, unique=True)
  email = db.Column(db.String(100), nullable=False, unique=True)
  provider = db.Column(db.String(50), nullable=False)
  password = db.Column(db.String(255), nullable=True)
  contact_number = db.Column(db.String(20), nullable=True, unique=True)
  profile_picture = db.Column(db.String(255), nullable=True)
  first_name = db.Column(db.String(50), nullable=False)
  last_name = db.Column(db.String(50), nullable=False)
  role = db.Column(db.String(20))
  created_at = db.Column(db.DateTime, default=datetime.now())
  classrooms = db.relationship('Classroom', secondary=classroom_user_tbl, back_populates='users')

  def __repr__(self):
    return f"User(email={self.email}, password={self.password}, first_name={self.first_name},last_name={self.last_name})"
  
  def get_json(self):
    return {
      'id': self.id,
      "email": self.email,
      "provider": self.provider,
      "password": self.password,
      "contact_number": self.contact_number,
      "profile_picture": self.profile_picture,
      "first_name": self.first_name,
      "last_name": self.last_name,
      "role": self.role,
      "created_at": self.created_at,
    }