import { jwtDecode } from 'jwt-decode';


// Получить токен из локального хранилища
export const getToken = () => {
    return localStorage.getItem('token');
};

// Проверка на авторизацию
export const isAuthenticated = () => {
    const token = getToken();
    if (!token) return false;

    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000; // Текущее время в секундах
        return decoded.exp > currentTime; // Проверка срока действия токена
    } catch (error) {
        return false;
    }
};

// Получить имя пользователя из токена
export const getUsername = () => {
    const token = getToken();
    if (!token) return null;

    try {
        const decoded = jwtDecode(token);
        return decoded.username;
    } catch (error) {
        return null;
    }
};

// Выход из аккаунта
export const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login'; // Перенаправление на страницу входа
};
