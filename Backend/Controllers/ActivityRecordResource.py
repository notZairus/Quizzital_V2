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