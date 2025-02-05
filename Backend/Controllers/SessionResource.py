from flask import request
from flask_restful import Resource, fields, marshal, abort
from pydantic import BaseModel, ValidationError
from typing import Optional
from Models.user_model import User


user_fields = {
  'id': fields.String,
  'email': fields.String,
  'provider': fields.String,
  'password': fields.String,
  'first_name': fields.String,
  'last_name': fields.String,
  'created_at': fields.String,
}

class get_user_validator(BaseModel):
  email: str
  password: str
  provider: str

class SessionResource(Resource):

  def post(self):
    try:
      data = request.get_json();
      validated_data = get_user_validator(**data).model_dump()
      user = User.query.filter_by(email = validated_data['email'], provider = validated_data['provider']).first();

      if not user:
        abort(404, message="User with this email doesn't exist.")
      
      print(user)
      return marshal(user, user_fields)
    
    except ValidationError as e:
      return {"errors": e.errors()}
    
