from flask_restful import Resource, abort
from flask import jsonify, request
from pydantic import BaseModel, ValidationError, fields
from typing import Optional
from datetime import datetime
from Models.activity_model import Activity
from configs import db


class post_activity_validator(BaseModel):
  classroom_id: int
  quiz_id: int
  name: str
  perfect_score: int
  open_at: datetime
  close_at: Optional[datetime] = None
  timer: Optional[int] = None


class ActivityResource(Resource):
  def post(self):
    try:
      data = request.get_json()
      validated_data = post_activity_validator(**data).model_dump()
      print(validated_data)
      new_activity = Activity(**validated_data)
      db.session.add(new_activity)
      db.session.commit()
      return jsonify(new_activity.to_json())

    except ValidationError as e:
      abort(404, message=e.errors())