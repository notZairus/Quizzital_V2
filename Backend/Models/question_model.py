from configs import db
from datetime import datetime


class Question(db.Model):
  id = db.Column(db.Integer, primary_key=True, unique=True, nullable=False)
  quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id', ondelete="CASCADE"), nullable=False)
  question = db.Column(db.String(255), nullable=False)
  type = db.Column(db.String(20), nullable=False)
  choices = db.Column(db.JSON)
  answer = db.Column(db.String(255), nullable=False)

  __table_args__ = (
    db.CheckConstraint("type IN ('multiple_choice', 'identification')", name='check_type'),
  )

  def __repr__(self):
    return f"Question(id={self.id}, quiz_id={self.quiz_id}, type={self.type}, choices={self.choices}, answer={self.answer})"
  
  def to_json(self):
    return {
      'id': self.id,
      'quiz_id': self.quiz_id,
      'question': self.question,
      'type': self.type,
      'choices': self.choices,
      'answer': self.answer
    }