import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Header.css'; 

const Header = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');  
        localStorage.removeItem('username'); 
        navigate('/login');  
    };

    return (
        <div className="header-container">
            <div className="header-logo">
                <img src='./logo.png' />
                <h1>GALARD CHAT</h1>
            </div>
            
            <button className="header-button" onClick={handleLogout}>
                Покинуть чат
            </button>
        </div>
    );
};

export default Header;
