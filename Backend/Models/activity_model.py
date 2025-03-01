from configs import db
from datetime import datetime
from .quiz_model import Quiz


class Activity(db.Model):
  id = db.Column(db.Integer, primary_key=True, unique=True, nullable=False)
  quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)
  classroom_id = db.Column(db.Integer, db.ForeignKey('classroom.id'), nullable=False)
  name = db.Column(db.String(100), nullable=False)
  score = db.Column(db.Integer, nullable=False, default=100)
  open_at = db.Column(db.DateTime, nullable=False)
  close_at = db.Column(db.DateTime)
  timer = db.Column(db.Integer)
  created_at = db.Column(db.DateTime, default=datetime.now())
  quiz = db.relationship('Quiz')

  def __repr__(self):
    return f"Activity(id=${self.id}, quiz_id={self.quiz_id}, classroom_id={self.classroom_id}, name={self.name}, score={self.score} open_at={self.open_at}, close_at={self.close_at}, timer={self.timer}, created_at={self.created_at})"
  

  def to_json(self):
    return {
      'id': self.id,
      'quiz_id': self.quiz_id,
      'classroom_id': self.classroom_id,
      'name': self.name,
      'score': self.score,
      'open_at': self.open_at,
      'close_at': self.close_at,
      'timer': self.timer,
      'created_at': self.created_at,
      'quiz': self.quiz.to_json()
    }