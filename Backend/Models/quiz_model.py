from datetime import datetime
from configs import db

class Quiz(db.Model):
  id = db.Column(db.Integer, primary_key=True, unique=True, nullable=False)
  user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
  name = db.Column(db.String(100), nullable=False)
  number_of_questions = db.Column(db.Integer, nullable=False, default=0)
  created_at = db.Column(db.DateTime, default = datetime.now())
  questions = db.relationship('Question', backref='quiz', lazy='joined', cascade="all, delete-orphan")  

  def __repr__(self):
    return f"Quiz(id={self.id}, user_id={self.user_id}, name={self.name}, number_of_questions={self.number_of_questions}, created_at={self.created_at})"
  
  def to_json(self):
    return {
      'id': self.id,
      'user_id': self.user_id,
      'name': self.name,
      'number_of_questions': self.number_of_questions,
      'created_at': self.created_at,
      'questions': [q.to_json() for q in self.questions]
    }