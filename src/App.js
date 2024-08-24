import React, { useState } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import './App.css';

function App() {
    const [clientId] = useState(uuidv4()); // Generate a unique ID for this client
    const [question, setQuestion] = useState('');
    const [response, setResponse] = useState('');

    const handleAskQuestion = async () => {
        setResponse('');

        try {
            // Send the question to the server via POST
            await axios.post(`http://localhost:3000/ask/${clientId}`, { question });

            // Establish the SSE connection to receive the streamed response
            const eventSource = new EventSource(`http://localhost:3000/ask/stream/${clientId}`);

            eventSource.onmessage = (event) => {
                if (event.data === '[END]') {
                    eventSource.close(); // Close the connection when stream ends
                } else {
                    setResponse(prev => prev + event.data);
                }
            };

            eventSource.onerror = (err) => {
                console.error('EventSource failed:', err);
                eventSource.close();
            };
        } catch (error) {
            console.error('Error asking question:', error);
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h1>Chatbot</h1>
            </div>
            <div className="chat-box">
                <div className="chat-log">
                    {response.split('\n').map((line, index) => (
                        line && <div key={index} className="chat-message bot">{line}</div>
                    ))}
                </div>
            </div>
            <div className="chat-input-container">
                <input
                    className="chat-input"
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Type your question here..."
                />
                <button className="chat-submit-button" onClick={handleAskQuestion}>Send</button>
            </div>
        </div>
    );
}

export default App;
