import React from 'react';
import '../styles/Message.css';

function Message({ username, text }) {
    return (
        <div className="message">
            <strong>{username}:</strong> {text}
        </div>
    );
}

export default Message;
