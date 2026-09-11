import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const SUGGESTED_QUESTIONS = [
  'How do I submit a complaint?',
  'How can I track my complaint?',
  'What does Under Review mean?',
  'How do I upload complaint evidence?',
  'How does complaint resolution work?',
  'What can I do on the citizen dashboard?'
];

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Personalized Greeting
  const citizenName = user?.name ? user.name.trim().split(' ')[0] : '';
  const greetingHeadline = citizenName ? `Hello ${citizenName}! 👋` : 'Hello! 👋';

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Focus input when opened on desktop
      if (window.innerWidth > 640) {
        setTimeout(() => inputRef.current?.focus(), 150);
      }
    }
  }, [messages, isOpen, isLoading]);

  // Send message to backend Gemini endpoint
  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    setErrorMessage('');
    const userMessage = { role: 'user', text };
    const nextMessages = [...messages, userMessage];

    // Optimistically update conversation UI
    setMessages(nextMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build conversation history (excluding current user turn)
      const historyPayload = messages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        text: m.text
      }));

      const res = await api.sendAIChatMessage(text, historyPayload);

      if (res.success && res.message) {
        setMessages((prev) => [
          ...prev,
          { role: 'model', text: res.message }
        ]);
      } else {
        setErrorMessage(res.message || 'Sorry, the AI Assistant is temporarily unavailable. Please try again later.');
      }
    } catch (err) {
      console.error('[AI Assistant] Communication failed:', err);
      const friendlyMsg = err.data?.message || err.message || 'Sorry, the AI Assistant is temporarily unavailable. Please try again later.';
      setErrorMessage(friendlyMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setErrorMessage('');
    setInputValue('');
  };

  return (
    <div className="crp-ai-assistant-container" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999 }}>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="crp-ai-fab"
          aria-label="Open CRP India AI Assistant"
          title="CRP India AI Assistant"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'var(--color-primary, #0B4F9C)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '50px',
            padding: '12px 20px',
            fontSize: '0.925rem',
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(11, 79, 156, 0.35)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit'
          }}
        >
          <Sparkles size={18} style={{ color: '#F8FAFC' }} />
          <span>AI Assistant</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className="crp-ai-chat-window"
          style={{
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: '540px',
            maxHeight: 'calc(100vh - 100px)',
            backgroundColor: 'var(--bg-surface, #FFFFFF)',
            border: '1px solid var(--border-subtle, #E2E8F0)',
            borderRadius: '16px',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.22)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'crpAiFadeIn 0.22s ease-out'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              backgroundColor: 'var(--color-primary, #0B4F9C)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Bot size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.925rem', fontWeight: 600, lineHeight: 1.2 }}>
                  CRP India AI Assistant
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.8)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                  <span>Powered by Gemini</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearChat}
                  title="Reset conversation"
                  aria-label="Reset conversation"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.8)',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <RefreshCw size={15} />
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close assistant"
                aria-label="Close assistant"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={19} />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              backgroundColor: 'var(--bg-page, #F8FAFC)'
            }}
          >
            {/* Welcome Greeting Banner */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface, #FFFFFF)',
                border: '1px solid var(--border-subtle, #E2E8F0)',
                borderRadius: '12px',
                padding: '14px',
                fontSize: '0.875rem',
                color: 'var(--text-secondary, #475569)',
                lineHeight: 1.5,
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--text-primary, #0F172A)', marginBottom: '4px', fontSize: '0.95rem' }}>
                {greetingHeadline}
              </div>
              <div>
                I'm the CRP India AI Assistant. I can help you understand and use the CRP India platform. What would you like to know?
              </div>
            </div>

            {/* Suggested Questions Chips (Displayed when conversation is fresh) */}
            {messages.length === 0 && (
              <div>
                <div style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-muted, #64748B)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Suggested questions:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {SUGGESTED_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleSendMessage(q)}
                      style={{
                        textAlign: 'left',
                        padding: '9px 12px',
                        backgroundColor: 'var(--bg-surface, #FFFFFF)',
                        border: '1px solid var(--border-subtle, #E2E8F0)',
                        borderRadius: '8px',
                        fontSize: '0.825rem',
                        color: 'var(--color-primary, #0B4F9C)',
                        fontWeight: 500,
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.15s ease, border-color 0.15s ease',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)'
                      }}
                      className="crp-ai-chip"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Conversation Messages */}
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '85%',
                      padding: '10px 14px',
                      borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      backgroundColor: isUser ? 'var(--color-primary, #0B4F9C)' : 'var(--bg-surface, #FFFFFF)',
                      color: isUser ? '#FFFFFF' : 'var(--text-primary, #0F172A)',
                      border: isUser ? 'none' : '1px solid var(--border-subtle, #E2E8F0)',
                      fontSize: '0.875rem',
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
                    }}
                  >
                    {msg.text}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted, #94A3B8)', marginTop: '3px', padding: '0 4px' }}>
                    {isUser ? 'You' : 'AI Assistant'}
                  </span>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: 'var(--bg-surface, #FFFFFF)', border: '1px solid var(--border-subtle, #E2E8F0)', borderRadius: '14px 14px 14px 2px', width: 'fit-content', boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)' }}>
                <Sparkles size={16} className="crp-ai-spin" style={{ color: 'var(--color-primary, #0B4F9C)' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #475569)', fontStyle: 'italic' }}>
                  Thinking...
                </span>
              </div>
            )}

            {/* Error Message Notice */}
            {errorMessage && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 12px', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', fontSize: '0.8125rem', color: 'var(--color-accent-urgent, #EF4444)' }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--bg-surface, #FFFFFF)',
              borderTop: '1px solid var(--border-subtle, #E2E8F0)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about CRP India..."
              disabled={isLoading}
              maxLength={1000}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle, #CBD5E1)',
                backgroundColor: 'var(--bg-page, #F8FAFC)',
                color: 'var(--text-primary, #0F172A)',
                fontSize: '0.875rem',
                outline: 'none',
                fontFamily: 'inherit'
              }}
              aria-label="Type your question for the AI Assistant"
            />

            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputValue.trim()}
              title="Send question"
              aria-label="Send question"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-primary, #0B4F9C)',
                color: '#FFFFFF',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: (isLoading || !inputValue.trim()) ? 'not-allowed' : 'pointer',
                opacity: (isLoading || !inputValue.trim()) ? 0.5 : 1,
                transition: 'opacity 0.15s ease'
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
