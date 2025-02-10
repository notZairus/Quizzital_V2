from flask import request, jsonify
from flask_restful import Resource, fields, marshal, abort
from pydantic import BaseModel, ValidationError
from typing import Optional
from Models.user_model import User
from configs import db


user_fields = {
  'id': fields.String,
  'email': fields.String,
  'provider': fields.String,
  'password': fields.String,
  'first_name': fields.String,
  'last_name': fields.String,
  'role': fields.String,
  'created_at': fields.String,
}

class get_user_validator(BaseModel):
  email: str
  first_name: Optional[str] = None
  last_name: Optional[str] = None
  password: Optional[str] = None
  provider: str

class SessionResource(Resource):

  def post(self):
    try:
      data = request.get_json();
      validated_data = get_user_validator(**data).model_dump()
      user = User.query.filter_by(email = validated_data['email'], provider = validated_data['provider']).first()

      if not user:
        if validated_data['provider'] == 'google':

          userr = User.query.filter_by(email = validated_data['email']).first()
          if userr:
            abort(403, message='The user is not registered using the selected provider.')

          new_user = User(**validated_data)
          db.session.add(new_user)
          db.session.commit()
          return marshal(new_user, user_fields)
        elif validated_data['provider'] == 'email':
          abort(404, message="User with this email doesn't exist.")
      
      return marshal(user, user_fields)
    except ValidationError as e:
      return {"errors": e.errors()}
    
