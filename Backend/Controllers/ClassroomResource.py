from flask_restful import Resource, abort, marshal, fields
from flask import jsonify, request
from pydantic import BaseModel, Field, ValidationError
from Models.classroom_model import Classroom
from configs import db

classroom_fields = {
  'id': fields.Integer,
  'user_id': fields.Integer,
  'name': fields.String,
  'classroom_key': fields.String
}

class get_owned_classroom_validator(BaseModel):
  user_id: int

class getClassroomResource(Resource):
  def post(self): # get all the classrooms based on the user id
    try:
      data = request.get_json()
      validated_data = get_owned_classroom_validator(**data).model_dump()
      classrooms = Classroom.query.filter_by(user_id = validated_data['user_id']).all();
      return marshal(classrooms, classroom_fields)
    except ValidationError as e:
      return jsonify({
        'message': e.errors()
      })

  
  
class create_classroom_validator(BaseModel):
  user_id: int
  name: str
  classroom_key: str

class ClassroomResource(Resource):
  def post(self):
    try:
      data = request.get_json()
      validated_data = create_classroom_validator(**data).model_dump()
      new_classroom = Classroom(**validated_data)
      db.session.add(new_classroom)
      db.session.commit()
      return marshal(new_classroom, classroom_fields)
    except ValidationError as e:
      return jsonify({
        'message': e.errors()
      })