import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Chat from './components/Chat';
import { isAuthenticated } from './utils/auth';
import './App.css';  
import Header from './components/Header';

function App() {
    return (
        <Router>
            <div className="app-container">
                <Routes>
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/chat"
                        element={isAuthenticated() ? (
                            <>
                                <Header /> 
                                <Chat />
                            </>
                        ) : <Navigate to="/login" />}
                    />
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
