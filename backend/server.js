const express = require('express');
const http = require('http');
const sqlite3 = require('sqlite3').verbose();
const { WebSocketServer } = require('ws');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Инициализация Express
const app = express();
port = 5000;
app.use(express.json());
app.use(cors());

// База данных SQLite
const db = new sqlite3.Database('./db/database.sqlite', (err) => {
    if (err) {
        console.error('Ошибка при подключении к базе данных:', err.message);
    } else {
        console.log('Подключение к базе данных установлено');
    }
});

// Создание таблиц, если они еще не существуют
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
    if (err) {
        console.error('Ошибка при создании таблицы:', err.message);
    }
});

// JWT секретный ключ
const SECRET_KEY = 'supersecretkey';

// HTTP-сервер
const server = http.createServer(app);

// WebSocket сервер
const wss = new WebSocketServer({ server });

// Подключенные клиенты
const clients = new Set();

// =====================
// *** WebSocket API ***
// =====================

wss.on('connection', (ws) => {
    console.log('Новое WebSocket-соединение');
    clients.add(ws);

    // Отправка истории сообщений при подключении
    db.all('SELECT * FROM messages ORDER BY id ASC', (err, rows) => {
        if (!err) {
            ws.send(JSON.stringify({ history: rows }));
            console.log('Отправлена история сообщений');
        }
    });

    // При получении нового сообщения от клиента
    ws.on('message', (message) => {
        console.log('Получено сообщение на сервере:', message);  // Логируем сообщение
    
        const data = JSON.parse(message);
    
        // Проверка на наличие username и message
        if (!data.username || !data.message) {
            console.error('Неверный формат сообщения:', data);
            return;
        }
    
        // Логирование данных перед вставкой в БД
        console.log('Попытка сохранить в БД:', data);
    
        // Сохраняем сообщение в базе данных
        db.run('INSERT INTO messages (username, message) VALUES (?, ?)', [data.username, data.message], function (err) {
            if (err) {
                console.error('Ошибка при сохранении в БД:', err.message);  // Логируем ошибку при сохранении
                return;
            }
    
            const savedMessage = { id: this.lastID, username: data.username, message: data.message };
            console.log('Сообщение сохранено в БД:', savedMessage);  // Логируем успешное сохранение
    
            // Отправляем сообщение всем подключенным клиентам
            clients.forEach((client) => {
                if (client.readyState === 1) {  // 1 = OPEN
                    client.send(JSON.stringify(savedMessage));
                }
            });
        });
    });

    // При отключении клиента
    ws.on('close', () => {
        clients.delete(ws);
    });
});


// =====================
// *** HTTP API ***
// =====================

// Регистрация нового пользователя
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Все поля обязательны' });
    }

    // Хешируем пароль перед сохранением
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка хеширования пароля' });
        }

        // Сохраняем нового пользователя в базе данных
        db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function (err) {
            if (err) {
                return res.status(500).json({ error: 'Ошибка регистрации пользователя' });
            }

            res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
        });
    });
});

// Авторизация пользователя
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Все поля обязательны' });
    }

    // Получаем пользователя из базы данных
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка авторизации' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        // Проверка пароля
        bcrypt.compare(password, row.password, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ error: 'Ошибка проверки пароля' });
            }
            if (!isMatch) {
                return res.status(401).json({ error: 'Неверный пароль' });
            }

            // Генерация JWT
            const token = jwt.sign({ id: row.id, username: row.username }, SECRET_KEY, { expiresIn: '1h' });

            res.json({ message: 'Авторизация успешна', token });
        });
    });
});


const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    
    if (!token) {
        return res.status(403).json({ message: 'Токен отсутствует' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Неверный токен' });
        }
        req.user = user; 
        next();
    });
};

let messages = []

// Получение всех сообщений из базы данных
app.get('/messages', authenticateToken, (req, res) => {
    db.all("SELECT * FROM messages ORDER BY id ASC", (err, rows) => {
        if (err) {
            console.error('Ошибка при запросе сообщений:', err); 
            return res.status(500).json({ success: false, message: 'Ошибка получения сообщений' });
        }

        if (rows.length === 0) {
            console.log('Сообщения не найдены'); 
            return res.json({ success: true, messages: [] });
        }

        console.log('Сообщения из базы данных:', rows); 
        res.json({ success: true, messages });
    });
});

// Запуск HTTP-сервера
server.listen(5000, () => {
    console.log('Сервер запущен на http://localhost:5000');
});
