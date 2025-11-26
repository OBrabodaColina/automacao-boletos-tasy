import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TabelaTitulos from './components/TabelaTitulos';
import AutomacaoStatus from './pages/AutomacaoStatus';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';

const App = () => {
  return (
    <main className="container mx-auto p-6">
        <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Rotas Protegidas */}
            <Route path="/" element={
                <PrivateRoute>
                    <TabelaTitulos />
                </PrivateRoute>
            } />
            <Route path="/status/:id" element={
                <PrivateRoute>
                    <AutomacaoStatus />
                </PrivateRoute>
            } />
        </Routes>
    </main>
    // ...
  );
};
export default App;