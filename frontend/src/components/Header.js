import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Header.css';  // Подключение файла стилей

const Header = () => {
    const navigate = useNavigate();

    // Функция для выхода из чата (покидает чат и перенаправляет на страницу входа)
    const handleLogout = () => {
        localStorage.removeItem('token');  // Удаление токена из localStorage
        localStorage.removeItem('username');  // Удаление имени пользователя из localStorage
        navigate('/login');  // Перенаправление на страницу авторизации
    };

    return (
        <div className="header-container">
            {/* Логотип и название проекта */}
            <div className="header-logo">
                <img src='./logo.png' />
                <h1>GALARD CHAT</h1>
            </div>
            
            {/* Кнопка выхода из чата */}
            <button className="header-button" onClick={handleLogout}>
                Покинуть чат
            </button>
        </div>
    );
};

export default Header;
