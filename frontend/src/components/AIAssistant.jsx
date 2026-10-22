import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
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

  const isBusy = isLoading || isStreaming;

  const { user } = useAuth();
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Draggable button state (session-only, resets on page refresh)
  const [position, setPosition] = useState(null); // { x: number, y: number } | null
  const [isDragging, setIsDragging] = useState(false);

  const buttonRef = useRef(null);
  const wasDraggedRef = useRef(false);
  const dragStartRef = useRef({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    hasMoved: false,
    pointerId: null
  });

  // Re-clamp button position when window is resized or orientation changes
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        if (!prev) return null; // Default position handles its own responsive styling
        const button = buttonRef.current;
        const width = button ? button.offsetWidth : 145;
        const height = button ? button.offsetHeight : 50;
        const margin = window.innerWidth <= 480 ? 12 : 16;
        const minX = margin;
        const maxX = Math.max(margin, window.innerWidth - width - margin);
        const minY = margin;
        const maxY = Math.max(margin, window.innerHeight - height - margin);

        const clampedX = Math.max(minX, Math.min(prev.x, maxX));
        const clampedY = Math.max(minY, Math.min(prev.y, maxY));

        if (clampedX === prev.x && clampedY === prev.y) return prev;
        return { x: clampedX, y: clampedY };
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const handlePointerDown = (e) => {
    // Only primary button (left mouse click or touch)
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: rect.left,
      initialY: rect.top,
      hasMoved: false,
      pointerId: e.pointerId
    };

    try {
      button.setPointerCapture(e.pointerId);
    } catch {
      // Safe fallback
    }
  };

  const handlePointerMove = (e) => {
    const { startX, startY, initialX, initialY, hasMoved, pointerId } = dragStartRef.current;
    if (pointerId === null || e.pointerId !== pointerId) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    // Movement threshold (5px) before committing to dragging state
    if (!hasMoved) {
      if (Math.hypot(dx, dy) < 5) return;
      dragStartRef.current.hasMoved = true;
      setIsDragging(true);
    }

    const button = buttonRef.current;
    const width = button ? button.offsetWidth : 145;
    const height = button ? button.offsetHeight : 50;

    const margin = window.innerWidth <= 480 ? 12 : 16;
    const minX = margin;
    const maxX = Math.max(margin, window.innerWidth - width - margin);
    const minY = margin;
    const maxY = Math.max(margin, window.innerHeight - height - margin);

    const proposedX = initialX + dx;
    const proposedY = initialY + dy;

    const clampedX = Math.max(minX, Math.min(proposedX, maxX));
    const clampedY = Math.max(minY, Math.min(proposedY, maxY));

    setPosition({ x: clampedX, y: clampedY });
  };

  const handlePointerUp = (e) => {
    const { hasMoved, pointerId } = dragStartRef.current;
    if (pointerId === null || e.pointerId !== pointerId) return;

    const button = buttonRef.current;
    if (button) {
      try {
        button.releasePointerCapture(e.pointerId);
      } catch {
        // Safe fallback
      }
    }

    dragStartRef.current.pointerId = null;
    setIsDragging(false);

    if (hasMoved) {
      wasDraggedRef.current = true;
      setTimeout(() => {
        wasDraggedRef.current = false;
      }, 120);
    }
  };

  const handlePointerCancel = () => {
    const button = buttonRef.current;
    if (button && dragStartRef.current.pointerId !== null) {
      try {
        button.releasePointerCapture(dragStartRef.current.pointerId);
      } catch {
        // Safe fallback
      }
    }
    dragStartRef.current.pointerId = null;
    setIsDragging(false);
  };

  const handleButtonClick = (e) => {
    if (wasDraggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      wasDraggedRef.current = false;
      return;
    }
    setIsOpen(true);
  };

  const handleButtonKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(true);
    }
  };

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
    <>
      {/* Floating Draggable Launcher Button with AI Girl Avatar */}
      {!isOpen && (
        <button
          ref={buttonRef}
          type="button"
          onClick={handleButtonClick}
          onKeyDown={handleButtonKeyDown}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          className={`crp-ai-fab ${isDragging ? 'crp-ai-fab-dragging' : ''} ${position ? 'crp-ai-fab-dragged' : ''}`}
          aria-label="Open CRP India AI Assistant"
          title="CRP India AI Assistant (Drag to reposition)"
          style={{
            position: 'fixed',
            left: position ? `${position.x}px` : undefined,
            top: position ? `${position.y}px` : undefined,
            right: position ? 'auto' : '24px',
            bottom: position ? 'auto' : '24px',
            zIndex: 999,
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
            boxShadow: isDragging
              ? '0 16px 36px rgba(11, 79, 156, 0.48)'
              : '0 8px 24px rgba(11, 79, 156, 0.35)',
            cursor: isDragging ? 'grabbing' : 'grab',
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            fontFamily: 'inherit',
            transition: isDragging ? 'none' : 'box-shadow 0.2s ease, transform 0.2s ease'
          }}
        >
          <div style={{ position: 'relative', width: '34px', height: '34px', flexShrink: 0, pointerEvents: 'none' }}>
            <img
              src={aiAssistantAvatar}
              alt="AI Assistant"
              draggable={false}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #FFFFFF',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                display: 'block',
                pointerEvents: 'none',
                userSelect: 'none',
                WebkitUserDrag: 'none'
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
                border: '1.5px solid #FFFFFF',
                pointerEvents: 'none'
              }}
            />
          </div>
          <span style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}>AI Assistant</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className="crp-ai-assistant-container crp-ai-chat-window"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 999,
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
              {(messages.length > 0 || isStreaming) && (
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
            </div>

            {/* Suggested Questions Chips (Displayed when conversation is fresh) */}
            {messages.length === 0 && !isStreaming && (
              <div>
                <div style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-muted, #64748B)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Suggested questions:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                      // Remove failed user turn and resend
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
        </div>
      )}
    </>
  );
}
