from datetime import datetime
from configs import db

class Quiz(db.Model):
  id = db.Column(db.Integer, primary_key=True, unique=True, nullable=False)
  user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
  name = db.Column(db.String(100), nullable=False)
  total_points = db.Column(db.Integer, nullable=False, default=0)
  created_at = db.Column(db.DateTime, default = datetime.now())

  def __repr__(self):
    return f"Quiz(id={self.id}, user_id={self.user_id}, name={self.name}, total_point={self.total_points}, created_at={self.created_at})"
  
  def to_json(self):
    return {
      'id': self.id,
      'user_id': self.user_id,
      'name': self.name,
      'total_points': self.total_points,
      'created_at': self.created_at
    }