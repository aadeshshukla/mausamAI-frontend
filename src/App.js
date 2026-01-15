import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const chatBoxRef = useRef(null);

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  };

  // Function to format text with markdown-like syntax
  const formatText = (text) => {
    if (!text) return text;

    const lines = text.split('\n');
    const formatted = [];
    let inCodeBlock = false;
    let codeBlockContent = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      
      // Handle code blocks
      if (trimmed.startsWith('```')) {
        if (inCodeBlock) {
          // End code block
          formatted.push(
            <pre key={idx} className="code-block">
              <code>{codeBlockContent.join('\n')}</code>
            </pre>
          );
          codeBlockContent = [];
          inCodeBlock = false;
        } else {
          // Start code block
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }
      
      // Handle headers
      if (trimmed.startsWith('###')) {
        formatted.push(
          <h3 key={idx} className="formatted-header">
            {trimmed.replace(/^###\s*/, '')}
          </h3>
        );
      } else if (trimmed.startsWith('##')) {
        formatted.push(
          <h4 key={idx} className="formatted-subheader">
            {trimmed.replace(/^##\s*/, '')}
          </h4>
        );
      } else if (trimmed.startsWith('#')) {
        formatted.push(
          <h2 key={idx} className="formatted-title">
            {trimmed.replace(/^#\s*/, '')}
          </h2>
        );
      }
      // Handle bullet points
      else if (trimmed.match(/^[\*\-]\s/)) {
        formatted.push(
          <li key={idx} className="formatted-list">
            {formatInlineMarkdown(trimmed. replace(/^[\*\-]\s/, ''))}
          </li>
        );
      }
      // Handle numbered lists
      else if (trimmed.match(/^\d+\.\s/)) {
        formatted.push(
          <li key={idx} className="formatted-list numbered">
            {formatInlineMarkdown(trimmed.replace(/^\d+\.\s/, ''))}
          </li>
        );
      }
      // Handle bold lines (entire line wrapped in **)
      else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        formatted.push(
          <p key={idx} className="formatted-bold">
            {trimmed.replace(/\*\*/g, '')}
          </p>
        );
      }
      // Handle regular paragraphs with inline formatting
      else if (trimmed) {
        formatted.push(
          <p key={idx} className="formatted-paragraph">
            {formatInlineMarkdown(line)}
          </p>
        );
      } else {
        formatted.push(<br key={idx} />);
      }
    });

    return formatted;
  };

  // Helper function to format inline markdown (**, *, `)
  const formatInlineMarkdown = (text) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      } else if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
        return <em key={i}>{part.slice(1, -1)}</em>;
      } else if (part. startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="inline-code">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  const handleSend = async () => {
    if (! input.trim()) return;

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

  // Auto-scroll whenever chat or typing status changes
  useEffect(() => {
    scrollToBottom();
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
          <p className="powered-by">Powered by Groq AI</p>
        </div>
      </div>
  
      {/* Main Chat Area */}
      <div className="chat-area">
        <div className="chat-header">
          <h3>Chat with mausamAI</h3>
        </div>

        <div className="chat-box" ref={chatBoxRef}>
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
                  <span className="time">{msg.time}</span>
                </div>
                <div className="message-text">
                  {msg.sender === 'bot' && ! msg.isError ?  formatText(msg.text) : msg.text}
                </div>
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
            disabled={!input. trim() || isTyping}
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
