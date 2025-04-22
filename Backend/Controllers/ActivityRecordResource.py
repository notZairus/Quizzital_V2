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
      SELECT answer.id, question.question, question.answer, answer.student_answer, answer.correct, activity.perfect_score, activity_record.user_score, question.type, question.choices, activity_record.id, activity_record.remarks FROM activity_record
      JOIN activity ON activity.id = activity_record.activity_id
      JOIN quiz ON quiz.id = activity.quiz_id
      JOIN question ON question.quiz_id = quiz.id
      JOIN answer ON answer.question_id = question.id AND answer.user_id = activity_record.user_id AND answer.activity_id = activity_record.activity_id
      WHERE answer.user_id = :user_id AND answer.activity_id = :activity_id; 
    """), {
      'user_id': user_id,
      'activity_id': activity_id
    }).fetchall()


    data_to_be_sent = {
      'activity_record_id': None,
      'perfect_score': None,
      'user_score': None,
      'remarks': None,
      'answers': [],
    }


    for i in range(len(activity_record)):
      data_to_be_sent['answers'].append({
        'id': activity_record[i][0],
        'question': activity_record[i][1],
        'type': activity_record[i][7],
        'choices': activity_record[i][8],
        'correct_answer': activity_record[i][2],
        'student_answer': activity_record[i][3],
        'correct': False if activity_record[i][4] == 0 else True,
      });
    
      if len(activity_record) - 1 == i:
        data_to_be_sent['activity_record_id'] = activity_record[i][9]
        data_to_be_sent['perfect_score'] = activity_record[i][5]
        data_to_be_sent['user_score'] = activity_record[i][6]
        data_to_be_sent['remarks'] = activity_record[i][10]
    
  
    return jsonify(data_to_be_sent)

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

  def patch(self):
    data = request.get_json()

    record = ActivityRecord.query.get(data['activity_id'])
    record.user_score = data['new_score']
    record.remarks = data['new_remarks']

    db.session.commit();

    return jsonify({
      'message': 'successful!',
      'status': 200
    })