from configs import db
from datetime import datetime
from .question_model import Question


class Answer(db.Model):
  id = db.Column(db.Integer, primary_key=True, unique=True, nullable=False)
  user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
  activity_id = db.Column(db.Integer, db.ForeignKey('activity.id', ondelete="CASCADE"), nullable=False)
  question_id = db.Column(db.Integer, db.ForeignKey('question.id', ondelete="SET NULL"), nullable=True)
  student_answer = db.Column(db.String(255), nullable=False)
  correct = db.Column(db.Boolean, nullable=False)
  created_at = db.Column(db.DateTime, default=datetime.now())
  question = db.relationship('Question')
  

  def __repr__(self):
    return f"Answer(id={self.id}, user_id={self.user_id}, question_id={self.question_id}, correct={self.correct})"
  
  def to_json(self):
    return {
      'id': self.id,
      'user_id': self.user_id,
      'question_id': self.question_id,
      'student_answer': self.student_answer,
      'correct': self.correct,
      'correct_answer': self.question.to_json(),
      'created_at': self.created_at,
      'question': self.question.to_json()
    }