import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = {
      sender: 'user',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChat(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/chat`, { 
        message: currentInput 
      });

      const botMsg = {
        sender: 'bot',
        text: res.data.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChat(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setChat(prev => [...prev, {
        sender: 'bot',
        text: '😢 Oops! Something went wrong. Please try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      }]);
    }

    setIsTyping(false);
  };

  const handleClearChat = () => {
    setChat([]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, isTyping]);

  return (
    <div className="app-container">
      
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2 className="app-title">🤖 mausamAI</h2>
          <p className="app-subtitle">Your AI Assistant</p>
        </div>
        
        <div className="sidebar-content">
          <div className="developer-info">
            <p className="label">Developed by</p>
            <p className="name">Aadesh Shukla</p>
          </div>
          
          {chat.length > 0 && (
            <button className="clear-btn" onClick={handleClearChat}>
              🗑️ Clear Chat
            </button>
          )}
        </div>

        <div className="sidebar-footer">
          <p className="powered-by">Powered by Mistral AI</p>
        </div>
      </div>
  
      {/* Main Chat Area */}
      <div className="chat-area">
        <div className="chat-header">
          <h3>Chat with mausamAI</h3>
        </div>

        <div className="chat-box">
          {chat.length === 0 && (
            <div className="welcome-message">
              <h2>👋 Welcome to mausamAI!</h2>
              <p>I'm here to help you.  Ask me anything! </p>
            </div>
          )}

          {chat.map((msg, i) => (
            <div key={i} className={`message-wrapper ${msg.sender}`}>
              <div className={`message ${msg.sender} ${msg.isError ? 'error' : ''}`}>
                <div className="message-header">
                  <strong>{msg.sender === 'user' ? 'You' : 'mausamAI'}</strong>
                  <span className="time">{msg. time}</span>
                </div>
                <div className="message-text">{msg.text}</div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message-wrapper bot">
              <div className="message bot typing">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
  
        <div className="input-area">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && ! e.shiftKey && handleSend()}
            placeholder="Type your message..."
            disabled={isTyping}
          />
          <button 
            onClick={handleSend} 
            disabled={! input.trim() || isTyping}
            className={input.trim() && !isTyping ? 'active' : ''}
          >
            {isTyping ? '⏳' : '📤'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
