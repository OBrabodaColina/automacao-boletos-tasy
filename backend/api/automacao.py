import threading
import uuid
from flask import request
from flask_restful import Resource
from concurrent.futures import ThreadPoolExecutor
from backend.selenium.tasy_automacao import processar_lote_titulos

JOBS = {} 

class AutomationManager:
    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=3)

    def start_job(self, titulos):
        job_id = str(uuid.uuid4())
        JOBS[job_id] = {
            "status": "EM_ANDAMENTO",
            "total": len(titulos),
            "concluidos": 0,
            "resultados": []
        }
        
        chunks = self._chunk_list(titulos, 3) 

        threading.Thread(target=self._run_batches, args=(job_id, chunks)).start()
        return job_id

    def _chunk_list(self, lista, num_chunks):
        avg = len(lista) / float(num_chunks)
        out = []
        last = 0.0
        while last < len(lista):
            out.append(lista[int(last):int(last + avg)])
            last += avg
        return out

    def _run_batches(self, job_id, chunks):
        futures = []
        for chunk_titulos in chunks:
            if not chunk_titulos: continue 
            future = self.executor.submit(processar_lote_titulos, chunk_titulos)
            futures.append(future)

        for future in futures:
            try:
                resultados_lote = future.result()
                
                for res in resultados_lote:
                    JOBS[job_id]["resultados"].append(res)
                    JOBS[job_id]["concluidos"] += 1
            except Exception as e:
                print(f"Erro ao processar lote: {e}")
        
        JOBS[job_id]["status"] = "CONCLUIDO"

manager = AutomationManager()

class ExecutarAutomacao(Resource):
    def post(self):
        data = request.json
        titulos = data.get('titulos', [])
        if not titulos:
            return {"error": "Lista de títulos vazia"}, 400
        
        job_id = manager.start_job(titulos)
        return {"job_id": job_id, "message": "Automação em lote iniciada"}, 202

class StatusAutomacao(Resource):
    def get(self, job_id):
        job = JOBS.get(job_id)
        if not job:
            return {"error": "Job não encontrado"}, 404
        return job, 200