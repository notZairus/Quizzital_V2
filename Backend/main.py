from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_restful import Api
import os
from configs import db, app, api



# Models / Database Tables
from Models.classroom_model import Classroom
from Models.user_model import User



# Controllers
from Controllers.RegisterResource import RegisterResource
api.add_resource(RegisterResource, '/register')

from Controllers.SessionResource import SessionResource
api.add_resource(SessionResource, '/login')

from Controllers.ClassroomResource import getClassroomResource
api.add_resource(getClassroomResource, '/get_classrooms')

from Controllers.ClassroomResource import ClassroomResource
api.add_resource(ClassroomResource, '/classroom')



@app.route('/user-role', methods=['PATCH'])
def get_role():
    data = request.get_json()
    
    if ('user_id' not in data) or ("role" not in data):
        return jsonify({
            'message': 'user_id or role property is required'
        }), 400
    
    user = User.query.filter_by(id=data['user_id']).first()
    user.role = data['role']
    db.session.commit()

    return jsonify(user.get_json())




if __name__ == "__main__":
    app.run(debug=True)