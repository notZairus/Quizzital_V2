from flask import Flask
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





if __name__ == "__main__":
    app.run(debug=True)