import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.css';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/register', { username, password });
            alert('Регистрация успешна!');
            navigate('/login');
        } catch (error) {
            alert('Ошибка регистрации');
        }
    };

    return (
        <div className="register-container">
            <form className="register-form" onSubmit={handleRegister}>
                <h2 className="register-title">Регистрация</h2>
                <input
                    className="register-input"
                    type="text"
                    placeholder="Имя пользователя"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    className="register-input"
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button className="register-button" type="submit">Зарегистрироваться</button>
                <p className="register-login-link">
                    Есть аккаунт? <a href="/login">Войдите</a>
                </p>
            </form>
        </div>
    );
}

export default Register;
