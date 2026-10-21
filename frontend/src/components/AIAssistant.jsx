import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  X,
  Send,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Search,
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  ChevronRight,
  ClipboardList,
  CheckCircle2,
  Tag,
  Building2,
  FileText,
  MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import StatusBadge from './StatusBadge';
import aiAssistantAvatar from '../assets/ai-assistant-girl.jpg';

const SUGGESTED_QUESTIONS = [
  'How do I submit a complaint?',
  'How can I track my complaint?',
  'What does Under Review mean?',
  'How do I upload complaint evidence?',
  'How does complaint resolution work?',
  'What can I do on the Citizen Dashboard?'
];

function parseInline(text, isStreaming = false) {
  if (!text) return [];

  let processed = text;
  if (isStreaming) {
    const boldMatches = (processed.match(/\*\*/g) || []).length;
    if (boldMatches % 2 !== 0) {
      processed += '**';
    }
  }

  const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const parts = processed.split(tokenRegex);

  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={i} style={{ fontWeight: 600, color: 'var(--text-primary, #0F172A)' }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={i}
          style={{
            padding: '1px 5px',
            backgroundColor: 'var(--bg-subtle, #F1F5F9)',
            border: '1px solid var(--border-subtle, #E2E8F0)',
            borderRadius: '4px',
            fontSize: '0.825em',
            fontFamily: 'monospace',
            color: 'var(--color-primary, #0B4F9C)'
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
      const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (match) {
        const linkText = match[1];
        const href = match[2];
        const isSafe =
          href.startsWith('https://') ||
          href.startsWith('http://') ||
          href.startsWith('/') ||
          href.startsWith('#') ||
          href.startsWith('mailto:');
        if (isSafe) {
          const isExternal = href.startsWith('http://') || href.startsWith('https://');
          return (
            <a
              key={i}
              href={href}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              style={{
                color: 'var(--color-primary, #0B4F9C)',
                textDecoration: 'underline',
                fontWeight: 500
              }}
            >
              {linkText}
            </a>
          );
        }
      }
    }
    return part;
  });
}

function parseMarkdownBlocks(rawText) {
  if (!rawText) return [];

  const lines = rawText.split('\n');
  const blocks = [];
  let currentList = null;
  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeLines = [];
  let paragraphLines = [];

  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      const text = paragraphLines.join('\n').trim();
      if (text) {
        blocks.push({ type: 'paragraph', text });
      }
      paragraphLines = [];
    }
  };

  const flushList = () => {
    if (currentList) {
      blocks.push(currentList);
      currentList = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        blocks.push({ type: 'codeblock', lang: codeBlockLang, code: codeLines.join('\n') });
        inCodeBlock = false;
        codeLines = [];
        codeBlockLang = '';
      } else {
        flushParagraph();
        flushList();
        inCodeBlock = true;
        codeBlockLang = trimmed.slice(3).trim();
        codeLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length,
        text: headingMatch[2]
      });
      continue;
    }

    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (orderedMatch) {
      flushParagraph();
      if (!currentList || currentList.type !== 'ordered') {
        flushList();
        currentList = { type: 'ordered', items: [] };
      }
      currentList.items.push(orderedMatch[2]);
      continue;
    }

    const unorderedMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (unorderedMatch) {
      flushParagraph();
      if (!currentList || currentList.type !== 'unordered') {
        flushList();
        currentList = { type: 'unordered', items: [] };
      }
      currentList.items.push(unorderedMatch[1]);
      continue;
    }

    // Regular line in paragraph
    flushList();
    paragraphLines.push(line);
  }

  flushParagraph();
  flushList();

  if (inCodeBlock && codeLines.length > 0) {
    blocks.push({ type: 'codeblock', lang: codeBlockLang, code: codeLines.join('\n') });
  }

  return blocks;
}

const MarkdownContent = React.memo(function MarkdownContent({ content, isStreaming = false }) {
  if (!content) return null;
  const blocks = parseMarkdownBlocks(content);

  return (
    <div className="crp-ai-markdown" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {blocks.map((block, idx) => {
        const isLastBlock = idx === blocks.length - 1;

        if (block.type === 'heading') {
          return (
            <div
              key={idx}
              style={{
                fontWeight: 700,
                fontSize: block.level === 1 ? '1.05rem' : (block.level === 2 ? '0.975rem' : '0.925rem'),
                color: 'var(--text-primary, #0F172A)',
                marginTop: idx === 0 ? 0 : '4px',
                marginBottom: 0,
                lineHeight: 1.35
              }}
            >
              {parseInline(block.text, isStreaming && isLastBlock)}
            </div>
          );
        }

        if (block.type === 'ordered') {
          return (
            <ol
              key={idx}
              style={{
                margin: '2px 0 4px 0',
                paddingLeft: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                lineHeight: 1.5
              }}
            >
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx}>
                  {parseInline(item, isStreaming && isLastBlock && itemIdx === block.items.length - 1)}
                </li>
              ))}
            </ol>
          );
        }

        if (block.type === 'unordered') {
          return (
            <ul
              key={idx}
              style={{
                margin: '2px 0 4px 0',
                paddingLeft: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                lineHeight: 1.5
              }}
            >
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx}>
                  {parseInline(item, isStreaming && isLastBlock && itemIdx === block.items.length - 1)}
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === 'codeblock') {
          return (
            <pre
              key={idx}
              style={{
                margin: '4px 0',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-subtle, #F1F5F9)',
                border: '1px solid var(--border-subtle, #E2E8F0)',
                borderRadius: '6px',
                fontSize: '0.8125rem',
                overflowX: 'auto',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.45
              }}
            >
              <code>{block.code}</code>
            </pre>
          );
        }

        // Default: paragraph
        return (
          <p
            key={idx}
            style={{
              margin: 0,
              lineHeight: 1.55,
              whiteSpace: 'pre-wrap'
            }}
          >
            {parseInline(block.text, isStreaming && isLastBlock)}
          </p>
        );
      })}
    </div>
  );
});

// Memoized Chat Bubble to avoid re-rendering committed history messages during streaming
const ChatMessageItem = React.memo(function ChatMessageItem({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        gap: '8px'
      }}
    >
      {!isUser && (
        <img
          src={aiAssistantAvatar}
          alt="AI"
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '1.5px solid var(--border-subtle, #E2E8F0)',
            flexShrink: 0,
            marginTop: '2px'
          }}
        />
      )}
      <div
        style={{
          maxWidth: '82%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isUser ? 'flex-end' : 'flex-start'
        }}
      >
        <div
          style={{
            padding: '10px 14px',
            borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
            backgroundColor: isUser ? 'var(--color-primary, #0B4F9C)' : 'var(--bg-surface, #FFFFFF)',
            color: isUser ? '#FFFFFF' : 'var(--text-primary, #0F172A)',
            border: isUser ? 'none' : '1px solid var(--border-subtle, #E2E8F0)',
            fontSize: '0.875rem',
            lineHeight: 1.5,
            wordBreak: 'break-word',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
          }}
        >
          {isUser ? (
            <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
          ) : (
            <MarkdownContent content={msg.text} />
          )}
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted, #94A3B8)', marginTop: '3px', padding: '0 4px' }}>
          {isUser ? 'You' : 'AI Assistant'}
        </span>
      </div>
    </div>
  );
});

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // AI Complaint Tracking State
  const [viewMode, setViewMode] = useState('chat'); // 'chat' | 'tracking-list' | 'tracking-detail'
  const [complaintsList, setComplaintsList] = useState([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);
  const [complaintsError, setComplaintsError] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const [complaintSearch, setComplaintSearch] = useState('');

  const isBusy = isLoading || isStreaming;

  const { user } = useAuth();
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Open tracking view and fetch complaints if needed
  const handleOpenTracking = useCallback(async () => {
    setViewMode('tracking-list');
    setErrorMessage('');
    if (!user) return;

    setComplaintsLoading(true);
    setComplaintsError('');
    try {
      const res = await api.getMyComplaints({ limit: 100 });
      if (res && res.success) {
        setComplaintsList(res.complaints || []);
      } else {
        setComplaintsError(res?.message || 'Unable to load your complaints at this time.');
      }
    } catch (err) {
      console.error('[AI Assistant] Error fetching complaints:', err);
      setComplaintsError(err?.message || 'Failed to load complaints. Please check your network connection.');
    } finally {
      setComplaintsLoading(false);
    }
  }, [user]);

  // Select complaint and fetch/generate AI summary
  const handleSelectComplaint = useCallback(async (complaint, forceRefresh = false) => {
    if (!complaint) return;
    setSelectedComplaint(complaint);
    setViewMode('tracking-detail');
    setSummaryError('');
    setSummaryLoading(true);

    try {
      const targetId = complaint.referenceId || complaint._id;
      const res = await api.getAIComplaintSummary(targetId, forceRefresh);
      if (res && res.success && res.data) {
        setSummaryData(res.data);
      } else {
        setSummaryError(res?.message || 'Unable to generate tracking summary for this complaint.');
      }
    } catch (err) {
      console.error('[AI Assistant] Error fetching AI summary:', err);
      setSummaryError(err?.message || 'Failed to generate AI summary. Please check your network connection.');
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const handleRefreshSummary = useCallback(() => {
    if (!selectedComplaint || summaryLoading) return;
    handleSelectComplaint(selectedComplaint, true);
  }, [selectedComplaint, summaryLoading, handleSelectComplaint]);

  const handleBackToList = useCallback(() => {
    setSelectedComplaint(null);
    setSummaryData(null);
    setSummaryError('');
    setViewMode('tracking-list');
  }, []);

  const handleBackToChat = useCallback(() => {
    setViewMode('chat');
  }, []);

  // Filter complaints by search query
  const filteredComplaints = useMemo(() => {
    if (!complaintSearch.trim()) return complaintsList;
    const q = complaintSearch.toLowerCase().trim();
    return complaintsList.filter((c) => {
      const ref = (c.referenceId || '').toLowerCase();
      const title = (c.title || '').toLowerCase();
      const cat = (c.category || '').toLowerCase();
      const status = (c.status || '').toLowerCase();
      return ref.includes(q) || title.includes(q) || cat.includes(q) || status.includes(q);
    });
  }, [complaintsList, complaintSearch]);

  // Streaming buffers & throttling refs
  const streamBufferRef = useRef('');
  const rafIdRef = useRef(null);
  const lastRenderTimeRef = useRef(0);
  const isUserAtBottomRef = useRef(true);

  // Clean up any ongoing stream or animation frame on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Personalized Greeting: safe extraction of first name from auth context
  const citizenName = user?.name ? user.name.trim().split(' ')[0] : '';
  const greetingHeadline = citizenName ? `Hello ${citizenName}! 👋` : 'Hello! 👋';

  // Smart auto-scroll: direct scrollTop manipulation without smooth animation clash
  const scrollToBottom = useCallback((smooth = false) => {
    const el = messagesContainerRef.current;
    if (!el) return;
    if (smooth) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    } else {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  // Track if user has manually scrolled up to avoid forcing them to the bottom
  const handleScroll = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    // If user is within 60px of the bottom, consider them "at bottom"
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= 60;
    isUserAtBottomRef.current = isAtBottom;
  }, []);

  // Focus & initial scroll when chat window opens
  useEffect(() => {
    if (isOpen) {
      isUserAtBottomRef.current = true;
      setTimeout(() => {
        scrollToBottom(false);
        if (window.innerWidth > 640) {
          inputRef.current?.focus();
        }
      }, 50);
    }
  }, [isOpen, scrollToBottom]);

  // Send message to backend Gemini endpoint with high-performance buffered streaming
  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isBusy) return;

    setErrorMessage('');
    const userMessage = { role: 'user', text };
    const nextMessages = [...messages, userMessage];

    // Optimistically commit user message
    setMessages(nextMessages);
    setInputValue('');
    setIsLoading(true);
    setIsStreaming(false);
    setStreamingText('');

    // Reset stream buffers
    streamBufferRef.current = '';
    lastRenderTimeRef.current = 0;
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    // Scroll to bottom after user message
    isUserAtBottomRef.current = true;
    setTimeout(() => scrollToBottom(false), 20);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    let hasReceivedFirstChunk = false;

    try {
      // Build conversation history (excluding current user turn)
      const historyPayload = messages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        text: m.text
      }));

      await api.streamAIChatMessage(
        text,
        historyPayload,
        (batchChunk, fullText) => {
          streamBufferRef.current = fullText;

          if (!hasReceivedFirstChunk) {
            hasReceivedFirstChunk = true;
            // First chunk received: instantly remove thinking indicator & show first text
            setIsLoading(false);
            setIsStreaming(true);
            setStreamingText(fullText);
            lastRenderTimeRef.current = performance.now();
            if (isUserAtBottomRef.current && messagesContainerRef.current) {
              messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            }
            return;
          }

          // Buffer and throttle subsequent chunks to target 25-30 UI updates per second maximum (~33ms)
          const now = performance.now();
          if (now - lastRenderTimeRef.current >= 33) {
            lastRenderTimeRef.current = now;
            if (rafIdRef.current) {
              cancelAnimationFrame(rafIdRef.current);
              rafIdRef.current = null;
            }
            setStreamingText(streamBufferRef.current);
            if (isUserAtBottomRef.current && messagesContainerRef.current) {
              messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            }
          } else if (!rafIdRef.current) {
            rafIdRef.current = requestAnimationFrame(() => {
              rafIdRef.current = null;
              lastRenderTimeRef.current = performance.now();
              setStreamingText(streamBufferRef.current);
              if (isUserAtBottomRef.current && messagesContainerRef.current) {
                messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
              }
            });
          }
        },
        controller.signal
      );

      // Clean up any pending animation frame
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }

      const finalFullText = streamBufferRef.current;
      if (finalFullText) {
        // Commit final message into history
        setMessages((prev) => [
          ...prev,
          { role: 'model', text: finalFullText }
        ]);
      } else if (!hasReceivedFirstChunk) {
        setErrorMessage('Sorry, no response was generated. Please try again.');
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        // Chat was intentionally cancelled or reset
        return;
      }
      console.error('[AI Assistant] Communication failed:', err);

      const friendlyMsg = err.data?.message || err.message || 'Sorry, the AI Assistant is temporarily unavailable. Please try again later.';
      setErrorMessage(friendlyMsg);
    } finally {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      setStreamingText('');
      setIsLoading(false);
      setIsStreaming(false);
      abortControllerRef.current = null;

      // Final scroll adjustment if user was following
      if (isUserAtBottomRef.current && messagesContainerRef.current) {
        setTimeout(() => {
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
          }
        }, 30);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    streamBufferRef.current = '';
    setStreamingText('');
    setIsLoading(false);
    setIsStreaming(false);
    setMessages([]);
    setErrorMessage('');
    setInputValue('');
  };

  return (
    <div className="crp-ai-assistant-container" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999 }}>
      {/* Floating Launcher Button with AI Girl Avatar */}
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
            padding: '8px 18px 8px 10px',
            fontSize: '0.925rem',
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(11, 79, 156, 0.35)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit'
          }}
        >
          <div style={{ position: 'relative', width: '34px', height: '34px' }}>
            <img
              src={aiAssistantAvatar}
              alt="AI Assistant"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #FFFFFF',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                display: 'block'
              }}
            />
            <span
              style={{
                position: 'absolute',
                bottom: '0px',
                right: '0px',
                width: '9px',
                height: '9px',
                backgroundColor: '#10B981',
                borderRadius: '50%',
                border: '1.5px solid #FFFFFF'
              }}
            />
          </div>
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
            height: '560px',
            maxHeight: 'calc(100vh - 90px)',
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
              padding: '12px 16px',
              backgroundColor: 'var(--color-primary, #0B4F9C)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative', width: '38px', height: '38px' }}>
                <img
                  src={aiAssistantAvatar}
                  alt="CRP AI Assistant"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid rgba(255, 255, 255, 0.9)',
                    display: 'block'
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    bottom: '1px',
                    right: '1px',
                    width: '9px',
                    height: '9px',
                    backgroundColor: '#10B981',
                    borderRadius: '50%',
                    border: '1.5px solid #0B4F9C'
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize: '0.925rem', fontWeight: 600, lineHeight: 1.2 }}>
                  CRP India AI Assistant
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.85)', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                  <span>Official Civic Support</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {viewMode === 'chat' && (messages.length > 0 || isStreaming) && (
                <button
                  type="button"
                  onClick={handleClearChat}
                  title="Reset conversation"
                  aria-label="Reset conversation"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.85)',
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

              {viewMode === 'tracking-list' && user && (
                <button
                  type="button"
                  onClick={handleOpenTracking}
                  title="Refresh complaints"
                  aria-label="Refresh complaints"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.85)',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <RefreshCw size={15} className={complaintsLoading ? 'crp-ai-spin' : ''} />
                </button>
              )}

              {viewMode === 'tracking-detail' && (
                <button
                  type="button"
                  onClick={handleRefreshSummary}
                  disabled={summaryLoading}
                  title="Refresh AI summary"
                  aria-label="Refresh AI summary"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.85)',
                    cursor: summaryLoading ? 'not-allowed' : 'pointer',
                    padding: '6px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: summaryLoading ? 0.6 : 1
                  }}
                >
                  <RefreshCw size={15} className={summaryLoading ? 'crp-ai-spin' : ''} />
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

          {/* Navigation Tab Bar: AI Chat & Track Complaint */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--bg-subtle, #EDF3F9)',
              padding: '4px',
              borderBottom: '1px solid var(--border-subtle, #E2E8F0)',
              gap: '4px'
            }}
          >
            <button
              type="button"
              onClick={handleBackToChat}
              style={{
                flex: 1,
                padding: '7px 10px',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                backgroundColor: viewMode === 'chat' ? 'var(--bg-surface, #FFFFFF)' : 'transparent',
                color: viewMode === 'chat' ? 'var(--color-primary, #0B4F9C)' : 'var(--text-secondary, #475569)',
                boxShadow: viewMode === 'chat' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <MessageSquare size={14} />
              <span>AI Guidance</span>
            </button>
            <button
              type="button"
              onClick={handleOpenTracking}
              style={{
                flex: 1,
                padding: '7px 10px',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                backgroundColor: viewMode !== 'chat' ? 'var(--bg-surface, #FFFFFF)' : 'transparent',
                color: viewMode !== 'chat' ? 'var(--color-primary, #0B4F9C)' : 'var(--text-secondary, #475569)',
                boxShadow: viewMode !== 'chat' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <ClipboardList size={14} />
              <span>Track Complaint</span>
            </button>
          </div>

          {/* VIEW MODE: CHAT */}
          {viewMode === 'chat' && (
            <>
              {/* Messages Body */}
              <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                style={{
                  flex: 1,
                  padding: '16px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  backgroundColor: 'var(--bg-subtle)',
                  scrollBehavior: 'auto'
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <img
                      src={aiAssistantAvatar}
                      alt="AI Assistant Avatar"
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid var(--color-primary, #0B4F9C)',
                        flexShrink: 0
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary, #0F172A)', fontSize: '0.95rem' }}>
                        {greetingHeadline}
                      </div>
                      <div style={{ fontSize: '0.825rem', color: 'var(--text-muted, #64748B)' }}>
                        I'm your CRP India AI Assistant. How can I help you today?
                      </div>
                    </div>
                  </div>

                  {/* Direct "Track Complaint" Callout inside Greeting Banner */}
                  <button
                    type="button"
                    onClick={handleOpenTracking}
                    style={{
                      marginTop: '10px',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '9px 14px',
                      backgroundColor: 'var(--color-primary-light, #EFF6FF)',
                      color: 'var(--color-primary, #0B4F9C)',
                      border: '1px solid var(--border-subtle, #CBDDF0)',
                      borderRadius: '8px',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    className="crp-ai-chip"
                  >
                    <ClipboardList size={16} />
                    <span>Track Complaint</span>
                  </button>
                </div>

                {/* Suggested Questions Chips (Displayed when conversation is fresh) */}
                {messages.length === 0 && !isStreaming && (
                  <div>
                    <div style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-muted, #64748B)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Suggested options & questions:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {/* Prominent Track Complaint Option Button */}
                      <button
                        type="button"
                        onClick={handleOpenTracking}
                        style={{
                          textAlign: 'left',
                          padding: '10px 12px',
                          backgroundColor: 'var(--color-primary, #0B4F9C)',
                          border: '1px solid var(--color-primary, #0B4F9C)',
                          borderRadius: '8px',
                          fontSize: '0.835rem',
                          color: '#FFFFFF',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 2px 5px rgba(11, 79, 156, 0.25)',
                          transition: 'opacity 0.15s ease'
                        }}
                      >
                        <ClipboardList size={15} />
                        <span>Track Complaint</span>
                      </button>

                      {/* Existing Suggested Questions preserved completely */}
                      {SUGGESTED_QUESTIONS.map((q, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={isBusy}
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
                            cursor: isBusy ? 'not-allowed' : 'pointer',
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

                {/* Committed Messages */}
                {messages.map((msg, index) => (
                  <ChatMessageItem key={index} msg={msg} />
                ))}

                {/* Active Streaming Message */}
                {isStreaming && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      justifyContent: 'flex-start',
                      gap: '8px'
                    }}
                  >
                    <img
                      src={aiAssistantAvatar}
                      alt="AI"
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '1.5px solid var(--border-subtle, #E2E8F0)',
                        flexShrink: 0,
                        marginTop: '2px'
                      }}
                    />
                    <div
                      style={{
                        maxWidth: '82%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start'
                      }}
                    >
                      <div
                        style={{
                          padding: '10px 14px',
                          borderRadius: '14px 14px 14px 2px',
                          backgroundColor: 'var(--bg-surface, #FFFFFF)',
                          color: 'var(--text-primary, #0F172A)',
                          border: '1px solid var(--border-subtle, #E2E8F0)',
                          fontSize: '0.875rem',
                          lineHeight: 1.5,
                          wordBreak: 'break-word',
                          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
                        }}
                      >
                        <MarkdownContent content={streamingText} isStreaming={true} />
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted, #94A3B8)', marginTop: '3px', padding: '0 4px' }}>
                        AI Assistant
                      </span>
                    </div>
                  </div>
                )}

                {/* Loading / Thinking Indicator (shown only before first chunk arrives) */}
                {isLoading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: 'var(--bg-surface, #FFFFFF)', border: '1px solid var(--border-subtle, #E2E8F0)', borderRadius: '14px 14px 14px 2px', width: 'fit-content', boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)' }}>
                    <img
                      src={aiAssistantAvatar}
                      alt="AI Thinking"
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                    <Sparkles size={16} className="crp-ai-spin" style={{ color: 'var(--color-primary, #0B4F9C)' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #475569)', fontStyle: 'italic' }}>
                      Thinking...
                    </span>
                  </div>
                )}

                {/* Error Message Notice with Retry */}
                {errorMessage && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 14px', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', fontSize: '0.8125rem', color: 'var(--color-accent-urgent, #EF4444)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{errorMessage}</span>
                    </div>
                    {messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                      <button
                        type="button"
                        onClick={() => {
                          const lastUserMsg = messages[messages.length - 1].text;
                          setMessages((prev) => prev.slice(0, -1));
                          handleSendMessage(lastUserMsg);
                        }}
                        style={{
                          alignSelf: 'flex-start',
                          padding: '4px 10px',
                          backgroundColor: 'transparent',
                          border: '1px solid var(--color-accent-urgent, #EF4444)',
                          borderRadius: '4px',
                          color: 'var(--color-accent-urgent, #EF4444)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Retry
                      </button>
                    )}
                  </div>
                )}
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
                  disabled={isBusy}
                  maxLength={1000}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                  aria-label="Type your question for the AI Assistant"
                />

                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={isBusy || !inputValue.trim()}
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
                    cursor: (isBusy || !inputValue.trim()) ? 'not-allowed' : 'pointer',
                    opacity: (isBusy || !inputValue.trim()) ? 0.5 : 1,
                    transition: 'opacity 0.15s ease'
                  }}
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          )}

          {/* VIEW MODE: TRACKING LIST */}
          {viewMode === 'tracking-list' && (
            <div
              style={{
                flex: 1,
                padding: '16px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                backgroundColor: 'var(--bg-subtle)'
              }}
            >
              {/* Unauthenticated notice */}
              {!user && (
                <div
                  style={{
                    padding: '20px 16px',
                    backgroundColor: 'var(--bg-surface, #FFFFFF)',
                    border: '1px solid var(--border-subtle, #E2E8F0)',
                    borderRadius: '12px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary-light, #EFF6FF)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-primary, #0B4F9C)'
                    }}
                  >
                    <ClipboardList size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary, #0F172A)' }}>
                      Citizen Login Required
                    </div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary, #475569)', marginTop: '4px', lineHeight: 1.45 }}>
                      Please log in to your Citizen account to access and track your submitted complaints with real-time AI status summaries.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '4px' }}>
                    <Link
                      to="/citizen/login"
                      onClick={() => setIsOpen(false)}
                      style={{
                        flex: 1,
                        padding: '9px 12px',
                        backgroundColor: 'var(--color-primary, #0B4F9C)',
                        color: '#FFFFFF',
                        borderRadius: '6px',
                        fontSize: '0.825rem',
                        fontWeight: 600,
                        textAlign: 'center',
                        textDecoration: 'none'
                      }}
                    >
                      Log In as Citizen
                    </Link>
                    <button
                      type="button"
                      onClick={handleBackToChat}
                      style={{
                        padding: '9px 12px',
                        backgroundColor: 'var(--bg-subtle, #F1F5F9)',
                        color: 'var(--text-secondary, #475569)',
                        border: '1px solid var(--border-subtle, #E2E8F0)',
                        borderRadius: '6px',
                        fontSize: '0.825rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Back to AI Chat
                    </button>
                  </div>
                </div>
              )}

              {/* Authenticated citizen list */}
              {user && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-primary, #0F172A)' }}>
                        Your Submitted Complaints
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748B)' }}>
                        Select any complaint to view its AI status summary
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenTracking}
                      disabled={complaintsLoading}
                      title="Refresh complaints list"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-primary, #0B4F9C)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}
                    >
                      <RefreshCw size={12} className={complaintsLoading ? 'crp-ai-spin' : ''} />
                      <span>Refresh</span>
                    </button>
                  </div>

                  {/* Filter Search Input (when multiple complaints exist) */}
                  {complaintsList.length > 3 && (
                    <div style={{ position: 'relative' }}>
                      <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted, #94A3B8)' }} />
                      <input
                        type="text"
                        value={complaintSearch}
                        onChange={(e) => setComplaintSearch(e.target.value)}
                        placeholder="Filter by ID, title, or category..."
                        style={{
                          width: '100%',
                          padding: '7px 10px 7px 30px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-subtle, #E2E8F0)',
                          backgroundColor: 'var(--bg-surface, #FFFFFF)',
                          color: 'var(--text-primary, #0F172A)',
                          fontSize: '0.8rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  )}

                  {/* Loading State */}
                  {complaintsLoading && (
                    <div
                      style={{
                        padding: '28px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        backgroundColor: 'var(--bg-surface, #FFFFFF)',
                        borderRadius: '10px',
                        border: '1px solid var(--border-subtle, #E2E8F0)'
                      }}
                    >
                      <Sparkles size={20} className="crp-ai-spin" style={{ color: 'var(--color-primary, #0B4F9C)' }} />
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #475569)' }}>
                        Loading your submitted complaints...
                      </span>
                    </div>
                  )}

                  {/* Error State */}
                  {!complaintsLoading && complaintsError && (
                    <div
                      style={{
                        padding: '12px 14px',
                        backgroundColor: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        borderRadius: '8px',
                        fontSize: '0.8125rem',
                        color: 'var(--color-accent-urgent, #EF4444)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertCircle size={16} />
                        <span>{complaintsError}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleOpenTracking}
                        style={{
                          alignSelf: 'flex-start',
                          padding: '4px 10px',
                          backgroundColor: 'transparent',
                          border: '1px solid var(--color-accent-urgent, #EF4444)',
                          borderRadius: '4px',
                          color: 'var(--color-accent-urgent, #EF4444)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {/* Empty State: No complaints submitted */}
                  {!complaintsLoading && !complaintsError && complaintsList.length === 0 && (
                    <div
                      style={{
                        padding: '24px 16px',
                        backgroundColor: 'var(--bg-surface, #FFFFFF)',
                        border: '1px solid var(--border-subtle, #E2E8F0)',
                        borderRadius: '12px',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '10px',
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
                      }}
                    >
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--bg-subtle, #F1F5F9)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-muted, #94A3B8)'
                        }}
                      >
                        <ClipboardList size={22} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-primary, #0F172A)' }}>
                          No complaints submitted yet
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #475569)', marginTop: '4px', lineHeight: 1.45 }}>
                          You have not reported any civic issues yet. Once you submit a complaint, you can track its progress and live AI status summaries right here.
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '4px' }}>
                        <Link
                          to="/account/complaints"
                          onClick={() => setIsOpen(false)}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            backgroundColor: 'var(--color-primary, #0B4F9C)',
                            color: '#FFFFFF',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            textAlign: 'center',
                            textDecoration: 'none'
                          }}
                        >
                          Submit a Complaint
                        </Link>
                        <button
                          type="button"
                          onClick={handleBackToChat}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: 'var(--bg-subtle, #F1F5F9)',
                            color: 'var(--text-secondary, #475569)',
                            border: '1px solid var(--border-subtle, #E2E8F0)',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Back to AI Chat
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Complaint List Display */}
                  {!complaintsLoading && !complaintsError && filteredComplaints.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {filteredComplaints.map((c) => {
                        const refId = c.referenceId || c._id;
                        const formattedCreated = new Date(c.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        });
                        const hasUpdate = c.updatedAt && c.updatedAt !== c.createdAt;
                        const formattedUpdated = hasUpdate
                          ? new Date(c.updatedAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })
                          : null;

                        return (
                          <button
                            key={c._id || refId}
                            type="button"
                            onClick={() => handleSelectComplaint(c)}
                            style={{
                              textAlign: 'left',
                              padding: '12px 14px',
                              backgroundColor: 'var(--bg-surface, #FFFFFF)',
                              border: '1px solid var(--border-subtle, #E2E8F0)',
                              borderRadius: '10px',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                              transition: 'all 0.15s ease',
                              fontFamily: 'inherit'
                            }}
                            className="crp-ai-chip"
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-primary, #0B4F9C)' }}>
                                {refId}
                              </span>
                              <StatusBadge status={c.status} size="small" />
                            </div>

                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary, #0F172A)', lineHeight: 1.35 }}>
                              {c.title}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted, #64748B)' }}>
                              <Tag size={12} />
                              <span>{c.category}</span>
                            </div>

                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                fontSize: '0.725rem',
                                color: 'var(--text-muted, #64748B)',
                                marginTop: '4px',
                                borderTop: '1px dashed var(--border-subtle, #E2E8F0)',
                                paddingTop: '6px'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>Filed: {formattedCreated}</span>
                                {formattedUpdated && <span>• Updated: {formattedUpdated}</span>}
                              </div>
                              <ChevronRight size={14} style={{ color: 'var(--color-primary, #0B4F9C)' }} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* VIEW MODE: TRACKING DETAIL */}
          {viewMode === 'tracking-detail' && selectedComplaint && (
            <div
              style={{
                flex: 1,
                padding: '16px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                backgroundColor: 'var(--bg-subtle)'
              }}
            >
              {/* Back to Complaints button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  onClick={handleBackToList}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary, #0B4F9C)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    padding: 0
                  }}
                >
                  <ArrowLeft size={15} />
                  <span>Back to Complaint List</span>
                </button>

                <button
                  type="button"
                  onClick={handleRefreshSummary}
                  disabled={summaryLoading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary, #0B4F9C)',
                    cursor: summaryLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    opacity: summaryLoading ? 0.6 : 1
                  }}
                >
                  <RefreshCw size={12} className={summaryLoading ? 'crp-ai-spin' : ''} />
                  <span>Refresh Summary</span>
                </button>
              </div>

              {/* Selected Complaint Overview Card */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface, #FFFFFF)',
                  border: '1px solid var(--border-subtle, #E2E8F0)',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-primary, #0B4F9C)' }}>
                      {summaryData?.referenceId || selectedComplaint.referenceId || selectedComplaint._id}
                    </span>
                    <Link
                      to={`/complaints/${summaryData?.referenceId || selectedComplaint.referenceId || selectedComplaint._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open full portal page in new tab"
                      style={{ color: 'var(--text-muted, #94A3B8)', display: 'inline-flex' }}
                    >
                      <ExternalLink size={13} />
                    </Link>
                  </div>
                  {/* Actual status ALWAYS directly from database */}
                  <StatusBadge status={summaryData?.status || selectedComplaint.status} />
                </div>

                <div style={{ fontSize: '0.925rem', fontWeight: 600, color: 'var(--text-primary, #0F172A)', lineHeight: 1.35 }}>
                  {summaryData?.title || selectedComplaint.title}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '0.75rem', color: 'var(--text-muted, #64748B)', marginTop: '2px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Tag size={12} />
                    {summaryData?.category || selectedComplaint.category}
                  </span>
                  {(summaryData?.recordedData?.assignedDepartment || selectedComplaint.assignedDepartment) && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Building2 size={12} />
                      {summaryData?.recordedData?.assignedDepartment || selectedComplaint.assignedDepartment}
                    </span>
                  )}
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} />
                    Filed {new Date(selectedComplaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* AI Summary Card */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface, #FFFFFF)',
                  border: '1.5px solid var(--border-subtle, #CBDDF0)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: '0 4px 12px rgba(11, 79, 156, 0.06)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle, #E2E8F0)', paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img
                      src={aiAssistantAvatar}
                      alt="AI"
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '1px solid var(--color-primary, #0B4F9C)'
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary, #0F172A)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>AI Status Summary</span>
                        <Sparkles size={14} style={{ color: 'var(--color-primary, #0B4F9C)' }} />
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #64748B)' }}>
                        Grounded strictly in official CRP records
                      </div>
                    </div>
                  </div>

                  {summaryData?.cached && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        backgroundColor: 'var(--bg-subtle, #F1F5F9)',
                        color: 'var(--text-muted, #64748B)',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        border: '1px solid var(--border-subtle, #E2E8F0)'
                      }}
                      title="Generated from complaint records at latest update time"
                    >
                      Up to date
                    </span>
                  )}
                </div>

                {/* Summary Loading Indicator */}
                {summaryLoading && (
                  <div style={{ padding: '24px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', textAlign: 'center' }}>
                    <Sparkles size={22} className="crp-ai-spin" style={{ color: 'var(--color-primary, #0B4F9C)' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #475569)', fontStyle: 'italic' }}>
                      Analyzing official records and generating complaint status summary...
                    </span>
                  </div>
                )}

                {/* Summary Error Indicator with Retry */}
                {!summaryLoading && summaryError && (
                  <div style={{ padding: '12px 14px', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', fontSize: '0.8125rem', color: 'var(--color-accent-urgent, #EF4444)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle size={16} />
                      <span>{summaryError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRefreshSummary}
                      style={{
                        alignSelf: 'flex-start',
                        padding: '4px 10px',
                        backgroundColor: 'transparent',
                        border: '1px solid var(--color-accent-urgent, #EF4444)',
                        borderRadius: '4px',
                        color: 'var(--color-accent-urgent, #EF4444)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* Rendered Summary Content */}
                {!summaryLoading && !summaryError && summaryData?.summary && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <MarkdownContent content={summaryData.summary} />

                    {/* Official Resolution Details Callout if Resolved */}
                    {summaryData.status === 'Resolved' && (
                      <div
                        style={{
                          marginTop: '6px',
                          padding: '10px 12px',
                          backgroundColor: 'var(--color-accent-green-bg, #DCFCE7)',
                          border: '1px solid var(--color-accent-green, #15803D)',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          color: '#064E3B',
                          lineHeight: 1.45
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '4px' }}>
                          <CheckCircle2 size={15} style={{ color: 'var(--color-accent-green, #15803D)' }} />
                          <span>Official Resolution Record</span>
                        </div>
                        <div>
                          {summaryData.recordedData?.resolutionNote || 'This complaint has been officially closed as resolved.'}
                        </div>
                        {summaryData.recordedData?.resolvedAt && (
                          <div style={{ fontSize: '0.725rem', color: '#047857', marginTop: '4px' }}>
                            Resolved on: {new Date(summaryData.recordedData.resolvedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Latest Recorded Authority Remark Callout */}
                    {summaryData.recordedData?.latestRemark && (
                      <div
                        style={{
                          marginTop: '4px',
                          padding: '8px 12px',
                          backgroundColor: 'var(--bg-subtle, #F1F5F9)',
                          border: '1px solid var(--border-subtle, #CBDDF0)',
                          borderRadius: '8px',
                          fontSize: '0.775rem',
                          color: 'var(--text-secondary, #475569)',
                          lineHeight: 1.45
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--text-primary, #0F172A)', marginBottom: '2px' }}>
                          <FileText size={13} style={{ color: 'var(--color-primary, #0B4F9C)' }} />
                          <span>Latest Recorded Authority Remark</span>
                        </div>
                        <div style={{ fontStyle: 'italic' }}>
                          "{summaryData.recordedData.latestRemark}"
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={handleBackToList}
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    backgroundColor: 'var(--bg-surface, #FFFFFF)',
                    border: '1px solid var(--border-subtle, #E2E8F0)',
                    borderRadius: '8px',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    color: 'var(--text-primary, #0F172A)',
                    cursor: 'pointer'
                  }}
                >
                  Select Another Complaint
                </button>
                <button
                  type="button"
                  onClick={handleBackToChat}
                  style={{
                    padding: '9px 14px',
                    backgroundColor: 'var(--color-primary-light, #EFF6FF)',
                    border: '1px solid var(--border-subtle, #CBDDF0)',
                    borderRadius: '8px',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    color: 'var(--color-primary, #0B4F9C)',
                    cursor: 'pointer'
                  }}
                >
                  Back to Guidance
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
