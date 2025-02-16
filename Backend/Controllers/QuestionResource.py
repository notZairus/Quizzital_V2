from flask import jsonify, request
from flask_restful import Resource, abort
from pydantic import BaseModel, ValidationError
from Models.question_model import Question
from typing import Optional, List
from configs import db


class create_question_validator(BaseModel):
  quiz_id: int
  type: str
  choices: Optional[List[str]] = None
  answer: str


class QuestionResource(Resource):
  def post(self):
    try:
      data = request.get_json()
      validated_data = create_question_validator(**data).model_dump()
      new_question = Question(**validated_data)
      db.session.add(new_question)
      db.session.commit()
      return jsonify(new_question.to_json())
    
    except ValidationError as e:
      return { 'message ': e.errors() }