from flask import Flask
from flask_restful import Api
from flask_cors import CORS
from backend.config import Config
from flask_jwt_extended import JWTManager
from backend.api.auth import Login
from backend.api.titulos import Titulos
from backend.api.automacao import ExecutarAutomacao, StatusAutomacao

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)
jwt = JWTManager(app)

api = Api(app)

api.add_resource(Login, '/api/login') 
api.add_resource(Titulos, '/api/titulos')
api.add_resource(ExecutarAutomacao, '/api/executar-automacao')
api.add_resource(StatusAutomacao, '/api/status-automacao/<string:job_id>')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5098)