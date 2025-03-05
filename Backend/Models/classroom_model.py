from configs import db
from datetime import datetime
from .classroom_user_tbl import classroom_user_tbl


class Classroom(db.Model):
  id = db.Column(db.Integer, primary_key=True, unique=True, nullable=False)
  user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
  name = db.Column(db.String(100), nullable=False)
  description = db.Column(db.Text)
  img_url = db.Column(db.String(150), nullable=False)
  classroom_key = db.Column(db.String(150), nullable=False, unique=True)
  created_at = db.Column(db.DateTime, default=datetime.now())
  users = db.relationship('User', secondary=classroom_user_tbl, back_populates='classrooms')
  activities = db.relationship('Activity')

  def __repr__(self):
    return f"Classroom(id={self.id}, user_id={self.user_id}, name={self.name}, classroom_key={self.classroom_key}, created_at:{self.created_at}, students:{self.users})"

  def to_json(self):
    return {
        "id": self.id,
        "user_id": self.user_id,
        "name": self.name,
        "description": self.description,
        "img_url": self.img_url,
      "classroom_key": self.classroom_key,
        "created_at": self.created_at,
        "students": [{
          'id': u.id,
          "email": u.email,
          "provider": u.provider,
          "password": u.password,
          "first_name": u.first_name,
          "last_name": u.last_name,
          "role": u.role,
          "created_at": u.created_at,
        } for u in self.users],
        "activities": [act.to_json() for act in self.activities]
    }