import React, { useState, useEffect, useRef } from 'react';
import { getUsername, getToken } from '../utils/auth';  
import '../styles/Chat.css'; 

const Chat = () => {
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState([]);
    const username = getUsername(); 
    const [ws, setWs] = useState(null);
    const messagesEndRef = useRef(null); 

    // Создаем WebSocket-соединение
    useEffect(() => {
        const socket = new WebSocket('ws://localhost:5000');
        setWs(socket);

        socket.onopen = () => {
            console.log('WebSocket подключен');
        };

        socket.onmessage = (event) => {
            const incomingMessage = JSON.parse(event.data);
            if (incomingMessage.deleted) {
                console.log('Сообщения были удалены');
                setMessages([]); 
            } else {
                setMessages((prevMessages) => [...prevMessages, incomingMessage]);
            }
        };

        socket.onclose = () => {
            console.log('WebSocket закрыт');
        };

        socket.onerror = (error) => {
            console.log('WebSocket ошибка:', error);
        };

        // Получаем сообщения при подключении
        fetchMessages();

        // Закрываем соединение WebSocket при размонтировании компонента
        return () => {
            socket.close();
        };
    }, []);  

    // Функция для получения всех сообщений
    const fetchMessages = async () => {
        const token = getToken(); 

        try {
            const response = await fetch('http://localhost:5000/messages', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Ошибка при запросе сообщений: ${response.statusText}`);
            }

            const data = await response.json();
            if (data.success) {
                setMessages(data.messages); 
            }
        } catch (error) {
            console.error('Ошибка при загрузке сообщений:', error);
        }
    };

    // Функция для отправки сообщения
    const sendMessage = () => {
        if (ws.readyState === WebSocket.OPEN) {
            if (!inputText.trim()) {
                console.error('Сообщение не может быть пустым');
                return;
            }

            const message = {
                username,
                message: inputText,
            };

            ws.send(JSON.stringify(message));  
            setInputText(''); 
        } else {
            console.error('WebSocket не подключен');
        }
    };

    // Обработчик нажатия клавиши Enter
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    // Функция для прокрутки к последнему сообщению
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Прокручиваем вниз, когда сообщения обновляются
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="chat-container">
            <div className="messages-container">
                {messages.length === 0 ? (
                    <div className='loading-messages'>Загружаются сообщения...</div>
                ) : (
                    messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`message ${msg.username === username ? 'self' : 'received'}`}
                        >
                            <strong>{msg.username}</strong> {msg.message}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="input-container">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Введите сообщение"
                />
                <button onClick={sendMessage}>Отправить</button>
            </div>
        </div>
    );
};

export default Chat;
