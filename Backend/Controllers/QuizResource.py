from flask import request, jsonify
from flask_restful import Resource, abort
from pydantic import BaseModel, ValidationError, Field
from Models.quiz_model import Quiz
from Models.user_model import User
from configs import db
from sqlalchemy.orm import joinedload


class create_quiz_validator(BaseModel):
  user_id: int
  name: str
  number_of_questions: int

class update_quiz_name_validator(BaseModel):
  quiz_id: int
  quiz_name: str

class delete_quiz_validator(BaseModel):
  quiz_id: int



class QuizResource(Resource):
  def post(self):
    try:
      data = request.get_json()
      validated_data = create_quiz_validator(**data).model_dump()
      new_quiz = Quiz(**validated_data)
      db.session.add(new_quiz)
      db.session.commit()
      return jsonify(new_quiz.to_json())
      
    except ValidationError as e:
      print({ 'message': e.errors() })
      abort(404, message=e.errors())


  def get(self):
    user_id = request.args.get('user_id')

    if user_id is not None:
      quizzes = Quiz.query.filter_by(user_id = user_id).options(joinedload(Quiz.questions)).all();
      quizzes_json = [];
      for quiz in quizzes:
        quizzes_json.append(quiz.to_json())
      return jsonify(quizzes_json);
  
    quizzes = Quiz.query.all();

    quizzes_json = [];
    for quiz in quizzes:
      quizzes_json.append(quiz.to_json())

    return jsonify(quizzes_json);


  def patch(self):
    try:
      validated_data = update_quiz_name_validator(**request.get_json())
      quiz = Quiz.query.filter_by(id=validated_data.quiz_id).first()
      quiz.name = validated_data.quiz_name

      db.session.commit()

      return jsonify({
        'status': 200,
        'message': 'success',
      })

    except ValidationError as e:
      return jsonify({ 'message': e.errors() })
    
  def delete(self):
    data = request.get_json()
    validated_data = delete_quiz_validator(**data).model_dump()
    quiz = Quiz.query.get(validated_data['quiz_id'])
    db.session.delete(quiz)
    db.session.commit()
    return jsonify({'message': 'success'})