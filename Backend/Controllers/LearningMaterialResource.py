import requests
from flask import request, jsonify
from flask_restful import Resource, abort
from Models.learning_material_model import LearningMaterial
from  pydantic import ValidationError, BaseModel
from configs import db


class post_lm_validator(BaseModel):
  classroom_id: int
  file_name: str
  link: str


class LearningMaterialResource(Resource):
  def post(self):
    try:
      data = request.get_json()
      validated_data = post_lm_validator(**data).model_dump()
      new_lm = LearningMaterial(**validated_data)
      db.session.add(new_lm)
      db.session.commit()
      return jsonify(new_lm.to_json())
      
    except ValidationError as e:
      abort(405, message=e.errors())