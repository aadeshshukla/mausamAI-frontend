import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './app.css'

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
    setInput('');
    setIsTyping(true);

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/chat`, { message: input });


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
        text: 'Something went wrong 😢',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }

    setIsTyping(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, isTyping]);

  return (
    <div className="app-container">
      
      {/* Sidebar */}
      <div className="sidebar">
        <h2 style={{ color: '#00FFFF', marginBottom: '40px' }}>🤖 mausamAI</h2>
        <p style={{ fontSize: '14px', color: '#aaa' }}>Developed by Team:</p>
        <p style={{ fontWeight: 'bold', color: '#fff' }}>Aadesh , Swathi , Ashish and Venkatesh</p>
      </div>
  
      {/* Main Chat Area */}
      <div className="chat-area">
        <div className="chat-box">
          {chat.map((msg, i) => (
            <div key={i} className={`message ${msg.sender}`}>
              <div><strong>{msg.sender === 'user' ? 'You' : 'mausamAI'}</strong></div>
              <div>{msg.text}</div>
              <div className="time">{msg.time}</div>
            </div>
          ))}
          {isTyping && (
            <div className="message bot">
              <i>mausamAI is typing...</i>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
  
        <div className="input-area">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
  

}

export default App;
