from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import text
import os
from configs import db, app, api



# Models / Database Tables
from Models.classroom_model import Classroom
from Models.user_model import User
from Models.quiz_model import Quiz
from Models.question_model import Question
from Models.activity_model import Activity
from Models.activity_record_model import ActivityRecord
from Models.answer_model import Answer



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

from Controllers.ActivityRecordResource import ActivityRecordResource
api.add_resource(ActivityRecordResource, '/activity-record');

from Controllers.AnswerResource import AnswerResource
api.add_resource(AnswerResource, '/answer')

from Controllers.LearningMaterialResource import LearningMaterialResource
api.add_resource(LearningMaterialResource, '/learning-material')



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
    

@app.route('/classroom-request', methods=['PATCH', 'DELETE'])
def classroom_request():
    data = request.get_json()

    if request.method == 'PATCH':
        result = db.session.execute(text("""UPDATE classroom_user_tbl SET status='accepted' WHERE user_id = :u_id AND classroom_id = :c_id"""), {
            "u_id": data['student_id'], 
            "c_id": data['classroom_id']
        })
        db.session.commit()
        return jsonify({'status': 200, 'message': 'successful!'})
    
    elif request.method == 'DELETE':
        db.session.execute(text("""DELETE FROM classroom_user_tbl WHERE user_id = :u_id AND classroom_id = :c_id"""), {
            "u_id": data['student_id'], 
            "c_id": data['classroom_id']
        })
        db.session.commit()
        return jsonify({'status': 200, 'message': 'successful!'})


@app.route('/send-notification', methods=['POST'])
def send_notification():
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart

    data = request.get_json()

    if not data['email']:
        return jsonify({'status': 404, 'message': 'empty email.'}), 404

    sender_email = "notzairus@gmail.com"
    receiver_email = data['email']
    password = "wvwk mxro fjuv mgyx"
    subject = "Reminder: Incomplete Activity"
    body = (
        "Good day,\n\n"
        "This is a reminder that you have not yet submitted the recent activity. "
        "Please make sure to complete it as soon as possible.\n\n"
    )

    message = MIMEMultipart()
    message['From'] = sender_email
    message['To'] = receiver_email
    message['Subject'] = subject

    message.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, password)
            server.sendmail(sender_email, receiver_email, message.as_string())
        return jsonify({'status': 200, 'message': 'successful!'}), 200
    except Exception as e:
        return jsonify({'status': 500, 'message': 'Unknown Error.'}), 500


@app.route('/user', methods=['PATCH'])
def update_user():
    data = request.get_json()
    print(data)

    user = User.query.filter_by(id=data['user_id']).first()
    print(user)

    user.first_name = data['f_name']
    user.last_name = data['l_name']
    user.profile_picture = data['dp']

    db.session.commit()

    return jsonify({"messsage": "successfull!"}), 200



if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)