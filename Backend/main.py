from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_restful import Api
import os
from configs import db, app, api



# Models / Database Tables
from Models.classroom_model import Classroom
from Models.user_model import User
from Models.quiz_model import Quiz
from Models.question_model import Question
from Models.activity_model import Activity



# Controllers/Resource
from Controllers.RegisterResource import RegisterResource
api.add_resource(RegisterResource, '/register')

from Controllers.SessionResource import SessionResource
api.add_resource(SessionResource, '/login')

from Controllers.ClassroomResource import getClassroomResource
api.add_resource(getClassroomResource, '/get_classrooms')

from Controllers.ClassroomResource import ClassroomResource
api.add_resource(ClassroomResource, '/classroom')

from Controllers.QuizResource import QuizResource
api.add_resource(QuizResource, '/quiz')

from Controllers.QuestionResource import QuestionResource
api.add_resource(QuestionResource, '/question')

from Controllers.ActivityResource import ActivityResource
api.add_resource(ActivityResource, '/activity')



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