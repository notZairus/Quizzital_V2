from flask_restful import Resource, abort
from flask import jsonify, request
from pydantic import BaseModel, ValidationError, fields
from typing import Optional
from datetime import datetime
from Models.activity_record_model import ActivityRecord
from configs import db
from sqlalchemy import text



class post_activity_record_validator(BaseModel):
  user_id: int
  activity_id: int
  user_score: int
  perfect_score: int
  remarks: str


class delete_activity_record_validator(BaseModel):
  user_id: int
  classroom_id: int
  

class ActivityRecordResource(Resource):
  def get(self):
    user_id = request.args.get('user_id')
    activity_id = request.args.get('activity_id')

    if not user_id:
      return jsonify({'message': 'missing user_id'})
    
    if not activity_id:
      return jsonify({'message': 'missing activity_id'})
    
    activity_record = db.session.execute(text("""
      SELECT DISTINCT answer.id, question.question, question.answer, answer.student_answer, answer.correct, activity.perfect_score, activity_record.user_score, question.type, question.choices FROM activity_record
      JOIN activity ON activity.id = activity_record.activity_id
      JOIN quiz ON quiz.id = activity.quiz_id
      JOIN question ON question.quiz_id = quiz.id
      JOIN answer ON answer.question_id = question.id
      WHERE activity_record.user_id = :user_id AND activity_record.activity_id = :activity_id; 
    """), {
      'user_id': user_id,
      'activity_id': activity_id
    }).fetchall()


    answers = [];

    for i in range(len(activity_record)):
      answers.append({
        'id': activity_record[i][0],
        'question': activity_record[i][1],
        'type': activity_record[i][7],
        'choices': activity_record[i][8],
        'correct_answer': activity_record[i][2],
        'student_answer': activity_record[i][3],
        'correct': False if activity_record[i][4] == 0 else True,
      });
    
  
    return jsonify({
      'perfect_score': activity_record[i][5],
      'user_score': activity_record[i][6],
      'answers': answers,
    })



  def post(self):
    try:
      data = request.get_json()
      validated_data = post_activity_record_validator(**data).model_dump()
      new_record = ActivityRecord(**validated_data)
      db.session.add(new_record)
      db.session.commit()
      print(new_record)
      return jsonify(new_record.to_json())

    except ValidationError as e:
      abort(404, message=e.errors())

  def delete(self):
    try:
      data = request.get_json()
      validated_data = delete_activity_record_validator(**data).model_dump()
      print(validated_data)

      db.session.execute(text("""
        DELETE activity_record 
        FROM activity_record 
        JOIN activity ON activity_record.activity_id = activity.id
        WHERE activity_record.user_id = :u_id AND activity.classroom_id = :c_id
      """), {
        "u_id": validated_data['user_id'], 
        "c_id": validated_data['classroom_id']
      })
      db.session.commit()

      return jsonify({'message': 'successful!'})
    except ValidationError as e:
      abort(404, message=e.errors())
