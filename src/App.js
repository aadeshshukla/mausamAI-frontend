import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

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
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#121212', color: '#f1f1f1', fontFamily: 'Arial' }}>
      
      {/* Sidebar */}
      <div style={{ width: '220px', backgroundColor: '#1f1f1f', padding: '20px', borderRight: '1px solid #333' }}>
        <h2 style={{ color: '#00FFFF', marginBottom: '40px' }}>🤖 mausamAI</h2>
        <p style={{ fontSize: '14px', color: '#aaa' }}>Developed by Team:</p>
        <p style={{ fontWeight: 'bold', color: '#fff' }}>Aadesh , Swathi , Ashish and Venkatesh</p>
        
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px' }}>
        {/* Chat box */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: '#1e1e1e',
          borderRadius: '8px',
          padding: '20px',
          border: '1px solid #333'
        }}>
          {chat.map((msg, i) => (
            <div key={i} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left', marginBottom: '10px' }}>
              <div>
                <strong style={{ color: msg.sender === 'user' ? '#00bfff' : '#00ff88' }}>
                  {msg.sender === 'user' ? 'You' : 'mausamAI'}
                </strong>
              </div>
              <div>{msg.text}</div>
              <div style={{ fontSize: '12px', color: '#888' }}>{msg.time}</div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div style={{ color: '#00ff88', fontStyle: 'italic', marginTop: 10 }}>mausamAI is typing...</div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div style={{ display: 'flex', marginTop: '15px', gap: '10px' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #555',
              backgroundColor: '#2b2b2b',
              color: '#fff'
            }}
          />
          <button onClick={handleSend} style={{
            padding: '10px 20px',
            backgroundColor: '#00bfff',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
