from configs import db
from datetime import datetime
from .classroom_user_tbl import classroom_user_tbl

class Classroom(db.Model):
  id = db.Column(db.Integer, primary_key=True, unique=True, nullable=False)
  user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
  name = db.Column(db.String(100), nullable=False)
  classroom_key = db.Column(db.String(150), nullable=False, unique=True)
  created_at = db.Column(db.DateTime, default=datetime.now())
  users = db.relationship('User', secondary=classroom_user_tbl, back_populates='classrooms')

  def __repr__(self):
    return f"Classroom(id={self.id}, user_id={self.user_id}, name={self.name}, classroom_key={self.classroom_key})"
  