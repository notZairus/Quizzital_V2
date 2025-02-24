from flask import jsonify, request
from flask_restful import Resource, abort
from pydantic import BaseModel, ValidationError
from Models.question_model import Question
from typing import Optional, List
from configs import db


class create_question_validator(BaseModel):
  quiz_id: int
  question: str
  type: str
  choices: Optional[List[str]] = None
  answer: str


class update_question_validator(BaseModel):
  question_id: Optional[int] = None 
  quiz_id: int
  question: str
  choices: Optional[List[str]] = None
  answer: str
  type: str


class delete_question_validator(BaseModel):
  question_id: int



class QuestionResource(Resource):

  # add question on the database
  def post(self):
    try:
      data = request.get_json()
      validated_data = create_question_validator(**data).model_dump()
      new_question = Question(**validated_data)
      db.session.add(new_question)
      db.session.commit()
      return jsonify(new_question.to_json())
    
    except ValidationError as e:
      print({ 'message ': e.errors() })
      return { 'message ': e.errors() }
    

  def patch(self):
    try:
      data = request.get_json()
      validated_data = update_question_validator(**data).model_dump();
      print(validated_data)

      if not validated_data['question_id']:
        print(f'data: {validated_data}')
        del validated_data['question_id']
        new_question = Question(**validated_data)
        db.session.add(new_question)
        db.session.commit()
        return jsonify({"message": 'success.'})
        
      question = Question.query.filter_by(id=validated_data['question_id']).first();
      question.question = validated_data['question']
      question.choices = validated_data['choices']
      question.answer = validated_data['answer']
      db.session.commit();
      return jsonify({"message": 'success.'})

    except ValidationError as e:
      abort(404, message=e.errors())


  def delete(self):
    try:
      data = request.get_json();
      validated_data = delete_question_validator(**data).model_dump()
      question = Question.query.get(validated_data['question_id']);
      db.session.delete(question);
      db.session.commit();
      return jsonify({'message': 'success!'})
      
    except ValidationError as e:
      return abort(404, message=e.errors())