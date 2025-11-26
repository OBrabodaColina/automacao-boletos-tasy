import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Loader2, Filter, Play, ChevronLeft, ChevronRight } from 'lucide-react';

const getHoje = () => new Date().toISOString().split('T')[0];

const TabelaTitulos = () => {
    const [titulos, setTitulos] = useState([]);
    
    const [filtros, setFiltros] = useState({ 
        nr_titulo: '', 
        pessoa: '', 
        status: '',
        dt_inicio: getHoje(), 
        dt_fim: getHoje() 
    });
    
    const [selecionados, setSelecionados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const itensPorPagina = 10; 

    const navigate = useNavigate();

    const buscarTitulos = async () => {
        setLoading(true);
        try {
            const filtrosLimpos = Object.fromEntries(
                Object.entries(filtros).filter(([_, v]) => v !== '')
            );
            const params = new URLSearchParams(filtrosLimpos).toString();
            
            const response = await api.get(`/titulos?${params}`);
            setTitulos(response.data);
            setPaginaAtual(1);
            setSelecionados([]);
        } catch (error) {
            console.warn("Erro ao buscar ou backend offline.");
            setTitulos([]); 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { buscarTitulos(); }, []);

    const indexUltimo = paginaAtual * itensPorPagina;
    const indexPrimeiro = indexUltimo - itensPorPagina;
    const titulosAtuais = titulos.slice(indexPrimeiro, indexUltimo);
    const totalPaginas = Math.ceil(titulos.length / itensPorPagina);

    const toggleSelecao = (nr_titulo) => {
        setSelecionados(prev => 
            prev.includes(nr_titulo) ? prev.filter(id => id !== nr_titulo) : [...prev, nr_titulo]
        );
    };

    const toggleSelecionarTodos = () => {
        if (selecionados.length === titulos.length && titulos.length > 0) {
            setSelecionados([]);
        } else {
            setSelecionados(titulos.map(t => t.NR_TITULO));
        }
    };

    const executarAutomacao = async () => {
        if (selecionados.length === 0) return alert("Selecione títulos.");
        try {
            const response = await api.post('/executar-automacao', { titulos: selecionados });
            navigate(`/status/${response.data.job_id}`);
        } catch (error) {
            alert("Erro ao iniciar automação.");
        }
    };

    const mudarPagina = (numero) => setPaginaAtual(numero);

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                 Envio de boletos por e-mail — Automação Tasy
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
                <input 
                    className="border p-2 rounded text-sm" 
                    placeholder="Número Título" 
                    value={filtros.nr_titulo}
                    onChange={e => setFiltros({...filtros, nr_titulo: e.target.value})}
                />
                <input 
                    className="border p-2 rounded text-sm" 
                    placeholder="Nome Pessoa" 
                    value={filtros.pessoa}
                    onChange={e => setFiltros({...filtros, pessoa: e.target.value})}
                />
                
                <select 
                    className="border p-2 rounded text-sm bg-white"
                    value={filtros.status}
                    onChange={e => setFiltros({...filtros, status: e.target.value})}
                >
                    <option value="">Todos os Status</option>
                    <option value="Aberto">Aberto</option>
                    <option value="Liquidado">Liquidado</option>
                    <option value="Cancelado">Cancelado</option>
                </select>

                <div className="flex gap-2 items-center col-span-2 md:col-span-1">
                    <input 
                        type="date" 
                        className="border p-2 rounded w-full text-sm" 
                        value={filtros.dt_inicio}
                        onChange={e => setFiltros({...filtros, dt_inicio: e.target.value})}
                    />
                    <input 
                        type="date" 
                        className="border p-2 rounded w-full text-sm" 
                        value={filtros.dt_fim}
                        onChange={e => setFiltros({...filtros, dt_fim: e.target.value})}
                    />
                </div>
                
                <button onClick={buscarTitulos} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-10 md:col-span-1">
                    {loading ? <Loader2 className="animate-spin w-4 h-4"/> : 'Pesquisar'}
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600"/></div>
            ) : (
                <>
                    <div className="overflow-x-auto border rounded-lg min-h-[400px]">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-bold">
                                <tr>
                                    <th className="p-3 w-10 text-center">
                                        <input 
                                            type="checkbox" 
                                            checked={titulos.length > 0 && selecionados.length === titulos.length}
                                            onChange={toggleSelecionarTodos}
                                            className="cursor-pointer"
                                        />
                                    </th>
                                    <th className="p-3">Título</th>
                                    <th className="p-3">Pessoa / CPF-CNPJ</th>
                                    <th className="p-3">Vencimento</th>
                                    <th className="p-3 text-right">Saldo</th>
                                    <th className="p-3">Situação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-sm">
                                {titulosAtuais.length > 0 ? titulosAtuais.map((t) => (
                                    <tr key={t.NR_TITULO} className={`hover:bg-blue-50 transition-colors ${selecionados.includes(t.NR_TITULO) ? 'bg-blue-50' : ''}`}>
                                        <td className="p-3 text-center">
                                            <input 
                                                type="checkbox" 
                                                checked={selecionados.includes(t.NR_TITULO)}
                                                onChange={() => toggleSelecao(t.NR_TITULO)}
                                                className="cursor-pointer"
                                            />
                                        </td>
                                        <td className="p-3 font-mono">{t.NR_TITULO}</td>
                                        <td className="p-3">
                                            <div className="font-medium text-gray-900">{t.NM_PESSOA}</div>
                                            <div className="text-xs text-gray-500">{t.DS_CPF_CNPJ}</div>
                                        </td>
                                        <td className="p-3">
                                            {t.DT_VENCIMENTO ? new Date(t.DT_VENCIMENTO).toLocaleDateString('pt-BR') : '-'}
                                        </td>
                                        <td className="p-3 text-right font-mono">
                                            {t.VL_SALDO_TITULO ? Number(t.VL_SALDO_TITULO).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}) : '0,00'}
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                                                String(t.DS_STATUS_TITULO).toLowerCase().includes('aberto') 
                                                ? 'bg-green-100 text-green-800 border-green-200' 
                                                : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                            }`}>
                                                {t.DS_STATUS_TITULO}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-gray-500">
                                            Nenhum título encontrado com os filtros selecionados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {titulos.length > 0 && (
                        <div className="flex items-center justify-between mt-4 border-t pt-4">
                            <span className="text-sm text-gray-600">
                                Mostrando <strong>{indexPrimeiro + 1}</strong> a <strong>{Math.min(indexUltimo, titulos.length)}</strong> de <strong>{titulos.length}</strong> resultados
                            </span>
                            
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => mudarPagina(paginaAtual - 1)} 
                                    disabled={paginaAtual === 1}
                                    className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                                    let pag = i + 1;
                                    if (totalPaginas > 5 && paginaAtual > 3) pag = paginaAtual - 3 + i;
                                    if (pag > totalPaginas) return null;
                                    
                                    return (
                                        <button 
                                            key={pag}
                                            onClick={() => mudarPagina(pag)}
                                            className={`px-3 py-1 border rounded text-sm ${paginaAtual === pag ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
                                        >
                                            {pag}
                                        </button>
                                    );
                                })}

                                <button 
                                    onClick={() => mudarPagina(paginaAtual + 1)} 
                                    disabled={paginaAtual === totalPaginas}
                                    className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="mt-4 flex justify-end">
                        <button 
                            onClick={executarAutomacao} 
                            disabled={selecionados.length === 0}
                            className={`px-6 py-2 rounded text-white flex items-center gap-2 font-medium shadow-sm transition-all ${selecionados.length ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'}`}
                        >
                            <Play className="w-4 h-4" /> 
                            Executar ({selecionados.length} selecionados)
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default TabelaTitulos;