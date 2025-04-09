from configs import db
from datetime import datetime
from .activity_model import Activity

class ActivityRecord(db.Model):
  __tablenamne__ = "activity_record"

  id = db.Column(db.Integer, primary_key=True, unique=True, nullable=False)
  user_id  = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
  activity_id = db.Column(db.Integer, db.ForeignKey('activity.id', ondelete="SET NULL"), nullable=True)
  user_score = db.Column(db.Integer, nullable=False, default=0)
  perfect_score = db.Column(db.Integer, nullable=False, default=100)
  remarks = db.Column(db.String(20), nullable=False)
  recorded_at = db.Column(db.DateTime, default=datetime.now())

  def __repr__(self):
    return f"ActivityRecord(id={self.id}, user_id={self.user_id}, activity_id={self.activity_id}, user_score={self.user_score}, remarks={self.remarks}, recorded_at={self.recorded_at})"
  
  def to_json(self):
    return {
      'id': self.id,
      'user_id': self.user_id,
      'activity_id': self.activity_id,
      'perfect_score': self.perfect_score,
      'user_score': self.user_score,
      'remarks': self.remarks,
      'recorded_at': self.recorded_at
    }