from flask_restful import Resource, abort, marshal, fields
from flask import jsonify
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


class ClassroomResource(Resource):
  def get(self): #get all classrooms
    try:
      classrooms = Classroom.query.all()
      return marshal(classrooms, classroom_fields)
    except ValidationError as e:
      return e.errors()
  
  