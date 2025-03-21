from configs import db
from datetime import datetime
from .question_model import Question


class LearningMaterial(db.Model):
  id = db.Column(db.Integer, primary_key=True, unique=True, nullable=False)
  classroom_id = db.Column(db.Integer, db.ForeignKey('classroom.id'), nullable=False)
  file_name = db.Column(db.String(255), nullable=False)
  link = db.Column(db.String(255), nullable=False)
  created_at = db.Column(db.DateTime, default=datetime.now())

  def __repr__(self):
    return f"LearningMaterial(id={self.id}, classroom_id={self.classroom_id}, file_name={self.file_name}, link={self.link}, created_at={self.created_at})"
  
  def to_json(self):
    return {
      'id': self.id,
      'classroom_id': self.classroom_id,
      'file_name': self.file_name,
      'link': self.link,
      'created_at': self.created_at
    }