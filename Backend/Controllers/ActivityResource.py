from flask_restful import Resource, abort
from flask import jsonify, request
from pydantic import BaseModel, ValidationError, fields
from typing import Optional
from datetime import datetime
from Models.activity_model import Activity
from configs import db
from sqlalchemy import text


class post_activity_validator(BaseModel):
  classroom_id: int
  quiz_id: int
  name: str
  perfect_score: int
  open_at: str
  close_at: Optional[str] = None
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

  def get(self):
    user_id = request.args.get('user_id');

    result = db.session.execute(text("""
      SELECT activity.*, classroom.name FROM activity
      JOIN classroom ON activity.classroom_id = classroom.id
      JOIN classroom_user_tbl ON classroom.id = classroom_user_tbl.classroom_id
      WHERE classroom_user_tbl.user_id = :user_id
    """), {
      "user_id": user_id
    }).fetchall()

    activities = []
    for i in range(len(result)):
      activities.append(Activity.query.filter_by(id=result[i].id).first().to_json())

    return jsonify({
      "activities": activities
    });