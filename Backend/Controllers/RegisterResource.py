from flask import request, jsonify
from flask_restful import Resource, abort
from pydantic import BaseModel, Field, ValidationError
from configs import db
from Models.user_model import User
from typing import Optional

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
      return jsonify(new_user.get_json())
    
    except ValidationError as e:
      return {'errors': e.errors()}

    