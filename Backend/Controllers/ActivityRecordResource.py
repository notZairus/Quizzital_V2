from flask_restful import Resource, abort
from flask import jsonify, request
from pydantic import BaseModel, ValidationError, fields
from typing import Optional
from datetime import datetime
from Models.activity_record_model import ActivityRecord
from configs import db


class post_activity_record_validator(BaseModel):
  user_id: int
  activity_id: int
  user_score: int

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