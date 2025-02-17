from flask import request, jsonify
from flask_restful import Resource, abort
from pydantic import BaseModel, ValidationError, Field
from Models.quiz_model import Quiz
from Models.user_model import User
from configs import db


class create_quiz_validator(BaseModel):
  user_id: int
  name: str
  number_of_questions: int


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