
rom flask_restful import Resource, fields, marshal



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

class UserResource(Resource):