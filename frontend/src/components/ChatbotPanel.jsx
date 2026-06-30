import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Heart, ShieldAlert, Award, ArrowRight } from 'lucide-react';

export default function ChatbotPanel({ isOpen, onClose, selectedHospitalId, selectedHospitalName, onActionClick }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am your **MediGuide AI Assistant**. 🩺 How can I help you find the right hospital today?',
      actions: ['Best Cardiology in Pune', 'What is TQI?', 'Emergency Support']
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Handle hospital context change
  useEffect(() => {
    if (isOpen && selectedHospitalId && selectedHospitalName) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: `I notice you are viewing **${selectedHospitalName}**. You can ask me about their: \n- 💰 **Treatment costs**\n- 👨‍⚕️ **Specialist doctors**\n- 💳 **Insurance panels**\n- 🏥 **ICU beds and emergency capability**`,
          actions: [
            `Show cost estimates for ${selectedHospitalName}`,
            `Who are the specialists at ${selectedHospitalName}?`,
            `Accepted insurance at ${selectedHospitalName}`
          ]
        }
      ]);
    }
  }, [selectedHospitalId, isOpen]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.strip && !text.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text: text }]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          hospital_id: selectedHospitalId,
          chat_history: messages.map(m => ({ sender: m.sender, text: m.text }))
        })
      });

      if (!response.ok) throw new Error('API server down');
      const data = await response.json();
      
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: data.reply,
          actions: data.suggested_actions
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: 'I am having trouble connecting to the MediGuide AI servers. Please ensure the backend server is running.',
          actions: ['Retry']
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      right: 0,
      top: '70px',
      bottom: 0,
      width: '400px',
      zIndex: 90,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
      animation: 'slideIn 0.3s ease-out'
    }} className="glass-panel">
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--primary-teal-alpha)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={20} style={{ color: 'var(--primary-teal)' }} />
          <div>
            <h3 style={{ fontSize: '1rem' }}>MediGuide Chatbot</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {selectedHospitalName ? `Context: ${selectedHospitalName}` : 'AI Guidance'}
            </span>
          </div>
        </div>
        <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <X size={20} />
        </button>
      </div>

      {/* Message List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {messages.map((m, idx) => (
          <div key={idx} style={{
            alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%'
          }}>
            <div style={{
              backgroundColor: m.sender === 'user' ? 'var(--primary-teal)' : 'var(--white)',
              color: m.sender === 'user' ? 'var(--white)' : 'var(--text-dark)',
              padding: '0.8rem 1rem',
              borderRadius: m.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              border: m.sender === 'user' ? 'none' : '1px solid var(--border-color)',
              fontSize: '0.9rem',
              whiteSpace: 'pre-line',
              boxShadow: 'var(--shadow-sm)'
            }}>
              {/* Highlight specific markdown-like bold tags */}
              {m.text.split('**').map((chunk, i) => i % 2 === 1 ? <strong key={i}>{chunk}</strong> : chunk)}
            </div>
            
            {/* Suggested actions inside bot response */}
            {m.sender === 'bot' && m.actions && m.actions.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.4rem',
                marginTop: '0.5rem'
              }}>
                {m.actions.map((act, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (act === 'Emergency Mode' || act === 'Activate Emergency Mode') {
                        onActionClick('emergency');
                      } else if (act.startsWith('Recommend') || act.startsWith('Best Cardiology')) {
                        onActionClick('recommend', act);
                      } else if (act.includes('Weights') || act.includes('Admin')) {
                        onActionClick('admin');
                      } else {
                        handleSend(act);
                      }
                    }}
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.3rem 0.6rem',
                      borderRadius: '999px',
                      border: '1px solid var(--primary-teal)',
                      backgroundColor: 'transparent',
                      color: 'var(--primary-teal)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      transition: 'all 0.15s ease'
                    }}
                    className="hover-action-btn"
                  >
                    {act} <ArrowRight size={10} />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '0.4rem', padding: '0.5rem' }}>
            <div className="pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-teal)' }}></div>
            <div className="pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-teal)', animationDelay: '0.2s' }}></div>
            <div className="pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-teal)', animationDelay: '0.4s' }}></div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{
        padding: '1rem',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        gap: '0.5rem',
        backgroundColor: 'var(--white)'
      }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask a question..."
          style={{
            flex: 1,
            padding: '0.6rem',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            outline: 'none',
            fontSize: '0.9rem'
          }}
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem' }}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
