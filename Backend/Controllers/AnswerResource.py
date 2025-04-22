from flask_restful import Resource, abort
from flask import jsonify, request
from pydantic import BaseModel, ValidationError, fields
from typing import Optional
from datetime import datetime
from Models.answer_model import Answer
from configs import db


class post_answer_validator(BaseModel):
  user_id: int
  activity_id: int
  question_id: int
  correct: bool
  student_answer: str


class AnswerResource(Resource):
  def post(self):
    try:
      data = request.get_json()
      print(data)
      validated_data = post_answer_validator(**data).model_dump()
      new_answer = Answer(**validated_data)
      db.session.add(new_answer)
      db.session.commit()
      print(new_answer)
      return jsonify(new_answer.to_json())

    except ValidationError as e:
      abort(404, message=e.errors())


  def patch(self):
    try:
      data = request.get_json()
      print(data)
      answer = Answer.query.get(data['answer_id'])
      answer.correct = not answer.correct
      db.session.commit()

      return jsonify({
        "message": "successful!",
        "status": 200
      })

    except Exception as e:
      return jsonify({
        "message": "unknown error",
      })