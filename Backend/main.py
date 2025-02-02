from flask import Flask
from flask_restful import Api, Resource, reqparse
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
api = Api(app)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
db = SQLAlchemy(app)

class UserModel(db.Model):
  id = db.Column(db.Integer, primary_key=True, nullable=False, unique=True)
  email = db.Column(db.String(100), nullable=False, unique=True)
  name = db.Column(db.String(100), nullable=False)
  created_at = db.Column(db.DateTime, default=datetime.now())

if __name__ == "__main__":
  app.run(debug=True)
