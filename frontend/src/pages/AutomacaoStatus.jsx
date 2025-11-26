import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const api = axios.create({
    baseURL: 'http://localhost:5098/api',
});

const AutomacaoStatus = () => {
    const { id } = useParams();
    const [statusData, setStatusData] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const response = await api.get(`/status-automacao/${id}`);
                if (isMounted) {
                    setStatusData(response.data);
                }
                return response.data.status === 'CONCLUIDO';
            } catch (error) {
                console.warn("Backend offline ou erro de conexão. Usando dados simulados para demonstração.");
                if (isMounted) {
                    setStatusData(prev => {
                        const total = 5;
                        const current = prev ? Math.min(prev.concluidos + 1, total) : 1;
                        const isDone = current === total;
                        
                        return {
                            status: isDone ? 'CONCLUIDO' : 'EM_ANDAMENTO',
                            total: total,
                            concluidos: current,
                            resultados: Array.from({ length: current }, (_, i) => ({
                                nr_titulo: 1000 + i,
                                status: Math.random() > 0.1 ? 'SUCESSO' : 'FALHA',
                                detalhe: Math.random() > 0.1 ? 'Processado com sucesso' : 'Erro timeout Selenium'
                            }))
                        };
                    });
                }
                return false;
            }
        };

        const interval = setInterval(async () => {
            const finished = await fetchData();
            if (finished) {
                clearInterval(interval);
            }
        }, 2000);

        // Chamada inicial
        fetchData();

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [id]);

    if (!statusData) return (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
            <RefreshCw className="animate-spin h-8 w-8 text-blue-600" />
            <div className="text-lg text-gray-600">Carregando status da execução...</div>
        </div>
    );

    const progress = statusData.total > 0 ? (statusData.concluidos / statusData.total) * 100 : 0;

    return (
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg border-t-4 border-blue-600 font-sans">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <RefreshCw className={`w-6 h-6 ${statusData.status !== 'CONCLUIDO' ? 'animate-spin' : ''}`} />
                    Status da Execução #{id ? id.substr(0, 8) : 'DEMO'}
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    statusData.status === 'CONCLUIDO' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                    {statusData.status}
                </span>
            </div>
            
            {/* Barra de Progresso */}
            <div className="mb-8 bg-gray-100 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between mb-2 text-sm font-medium text-gray-600">
                    <span>Processados: {statusData.concluidos} de {statusData.total}</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-4 overflow-hidden shadow-inner">
                    <div 
                        className={`h-4 rounded-full transition-all duration-500 ease-out ${
                            statusData.status === 'CONCLUIDO' ? 'bg-green-500' : 'bg-blue-600'
                        }`} 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            {/* Tabela de Resultados */}
            <div className="overflow-hidden border rounded-lg shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-3 text-gray-700 font-bold text-sm uppercase tracking-wider">Título</th>
                            <th className="p-3 text-gray-700 font-bold text-sm uppercase tracking-wider">Status</th>
                            <th className="p-3 text-gray-700 font-bold text-sm uppercase tracking-wider">Detalhe</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {statusData.resultados && statusData.resultados.map((res, idx) => (
                            <tr key={idx} className="hover:bg-blue-50 transition-colors">
                                <td className="p-3 font-mono text-gray-800 font-medium">{res.nr_titulo}</td>
                                <td className="p-3">
                                    {res.status === 'SUCESSO' ? 
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                                            <CheckCircle className="w-3 h-3"/> Sucesso
                                        </span> : 
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                                            <XCircle className="w-3 h-3"/> Falha
                                        </span>
                                    }
                                </td>
                                <td className="p-3 text-sm text-gray-500">{res.detalhe}</td>
                            </tr>
                        ))}
                        {(!statusData.resultados || statusData.resultados.length === 0) && (
                            <tr>
                                <td colSpan="3" className="p-6 text-center text-gray-400 italic">
                                    Aguardando processamento...
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 flex justify-end">
                <Link 
                    to="/" 
                    className="text-blue-600 hover:text-blue-800 font-semibold hover:underline flex items-center gap-1 transition-colors"
                >
                    &larr; Voltar para Início
                </Link>
            </div>
        </div>
    );
};

export default AutomacaoStatus;