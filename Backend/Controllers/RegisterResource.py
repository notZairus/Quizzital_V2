from flask import request
from flask_restful import Resource, marshal, fields, abort
from pydantic import BaseModel, Field, ValidationError
from configs import db
from Models.user_model import User
from typing import Optional

# this is for marshal_with
user_fields = {
  'id': fields.Integer,
  'email': fields.String,
  'provider': fields.String,
  'password': fields.String,
  'first_name': fields.String,
  'last_name': fields.String,
  'created_at': fields.String,
}

#this is for validation
class create_user_validator(BaseModel):
  email: str = Field(description="User's email")
  provider: str
  password: Optional[str] = None 
  first_name: str = Field(min_length=2, description="User's first name")
  last_name: str = Field(min_length=2)

class RegisterResource(Resource):

  def post(self):
    try:
      data = request.get_json()
      validatedData = create_user_validator(**data).model_dump()
      print(validatedData)
      user = User.query.filter_by(email=validatedData['email']).first()
      
      if user:
        abort(400, message="User with this email already exist.")
      
      new_user = User(**validatedData)
      db.session.add(new_user)
      db.session.commit()
      return marshal(new_user, user_fields)
    
    except ValidationError as e:
      return {'errors': e.errors()}

    