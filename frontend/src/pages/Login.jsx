import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/login', { username, password });
            // Salva o token no navegador
            localStorage.setItem('token', response.data.access_token);
            // Configura o Axios para usar esse token daqui pra frente
            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
            navigate('/');
        } catch (err) {
            setError('Credenciais inválidas. Tente novamente.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-96">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">Portal Automação Tasy</h1>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Usuário</label>
                        <div className="relative mt-1">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <User size={18} />
                            </span>
                            <input 
                                type="text"
                                className="pl-10 w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Senha</label>
                        <div className="relative mt-1">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <Lock size={18} />
                            </span>
                            <input 
                                type="password"
                                className="pl-10 w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <button 
                        type="submit" 
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-semibold"
                    >
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;