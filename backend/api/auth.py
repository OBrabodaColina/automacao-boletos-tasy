from flask import request
from flask_restful import Resource
from flask_jwt_extended import create_access_token
from backend.config import Config

class Login(Resource):
    def post(self):
        username = request.json.get('username')
        password = request.json.get('password')

        if username == Config.APP_USER and password == Config.APP_PASS:
            access_token = create_access_token(identity=username)
            return {'access_token': access_token}, 200
        
        return {'msg': 'Usuário ou senha incorretos'}, 401