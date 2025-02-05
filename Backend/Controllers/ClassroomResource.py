from flask_restful import Resource, abort, marshal, fields
from flask import jsonify, request
from pydantic import BaseModel, Field, ValidationError
from Models.classroom_model import Classroom

classroom_fields = {
  'id': fields.Integer,
  'user_id': fields.Integer,
  'name': fields.String,
  'classroom_key': fields.String
}

class get_owned_classroom_validator(BaseModel):
  user_id: int


class create_classroom_validator(BaseModel):
  user_id: int
  name: str
  classroom_key: str


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

  
  