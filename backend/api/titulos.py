from flask import request
from flask_restful import Resource
from backend.db.connection import buscar_titulos
from datetime import datetime, date

def serialize_value(value):
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    return value

def serialize_row(row):
    return {key: serialize_value(value) for key, value in row.items()}

class Titulos(Resource):
    def get(self):
        filtros = {
            'nr_titulo': request.args.get('nr_titulo'),
            'pessoa': request.args.get('pessoa'),
            'status': request.args.get('status'),
            'dt_inicio': request.args.get('dt_inicio'),
            'dt_fim': request.args.get('dt_fim')
        }

        try:
            dados = buscar_titulos(filtros)

            if isinstance(dados, list):
                dados = [serialize_row(row) for row in dados]
            elif isinstance(dados, dict):
                dados = serialize_row(dados)

            return dados, 200

        except Exception as e:
            return {"error": f"Erro interno: {str(e)}"}, 500
