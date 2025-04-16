from flask_restful import Resource, abort, marshal, fields
from flask import jsonify, request
from pydantic import BaseModel, ValidationError
from Models.classroom_model import Classroom
from Models.user_model import User
from configs import db
from typing import Optional

classroom_fields = {
  'id': fields.Integer,
  'user_id': fields.Integer,
  'name': fields.String,
  'classroom_key': fields.String,
  'users': fields.List
}


class get_owned_classroom_validator(BaseModel):
  user_id: int
  role: str

class getClassroomResource(Resource):
  def post(self):
    try:
      data = request.get_json()
      validated_data = get_owned_classroom_validator(**data).model_dump()
      
      if (validated_data['role'] == 'professor'):
        classrooms = Classroom.query.filter_by(user_id = validated_data['user_id']).all();
        return jsonify([c.to_json() for c in classrooms]);
        
      else:
        user = User.query.filter_by(id=validated_data['user_id']).first()
        classrooms = [c.to_json() for c in user.classrooms]
        return jsonify(classrooms)
      
    except ValidationError as e:
      return jsonify({
        'message': e.errors()
      })

  
  
class add_classroom_validator(BaseModel):
  user_id: int
  name: Optional[str] = None
  description: Optional[str] = None
  img_url: Optional[str] = None
  classroom_key: str
  role: str

class ClassroomResource(Resource):
  def post(self):
    try:
      data = request.get_json()
      validated_data = add_classroom_validator(**data).model_dump()
      print(validated_data)

      if (validated_data['role'] == 'professor'):
        new_classroom = Classroom(user_id=validated_data['user_id'], name=validated_data['name'], description=validated_data['description'], img_url=validated_data['img_url'], classroom_key=validated_data['classroom_key'])
        print(validated_data)
        db.session.add(new_classroom)
        db.session.commit()
        return jsonify(new_classroom.to_json())

      else:
        user = User.query.get(validated_data['user_id'])
        classroom = Classroom.query.filter_by(classroom_key=validated_data['classroom_key']).first()

        if not classroom:
          abort(404, message='classroom not found .')
        
        try:
          user.classrooms.append(classroom)
          db.session.commit();
          return jsonify([c.to_json() for c in user.classrooms])
        except Exception as e:
          abort(500, message='user is already a member of this class.')
      
    except ValidationError as e:
      return jsonify({
        'message': e.errors()
      })
    
  def delete(self):
    data = request.get_json()

    if not data['classroom_id']:
      return jsonify({'message': 'missing classroom id'})
    
    classroom = Classroom.query.get(data['classroom_id'])

    print(classroom)
    db.session.delete(classroom)
    db.session.commit()

    return jsonify({"message": "successful!"})