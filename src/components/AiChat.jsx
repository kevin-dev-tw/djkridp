import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLang } from '../i18n.jsx';
import { formatReply, linkify } from '../lib/formatReply.js';

const API_URL = '/api/chat';
const STORAGE_KEY = 'ai_chat_history';
const VIRTUAL_SCROLL_THRESHOLD = 50;
const ESTIMATED_ITEM_HEIGHT = 80;
const BUFFER = 5;

const QUICK_QUESTIONS = [
  { num: '01', label: 'chat.q1', question: 'chat.q1q' },
  { num: '02', label: 'chat.q2', question: 'chat.q2q' },
  { num: '03', label: 'chat.q3', question: 'chat.q3q' },
  { num: '04', label: 'chat.q4', question: 'chat.q4q' },
];

const MUSIC_LINKS = [
  { label: 'Spotify', href: 'https://open.spotify.com/artist/22Mjn2JlrMAPgUEqozf4Re',
    icon: <svg viewBox="0 0 226.733 226.733" height="16" width="16" fill="currentColor" aria-hidden="true"><path d="M1345.62 945.281c-269.94 160.309-715.202 175.049-972.893 96.839-41.383-12.56-85.145 10.81-97.68 52.18-12.543 41.41 10.793 85.14 52.207 97.72 295.812 89.79 787.556 72.45 1098.316-112.02 37.22-22.1 49.43-70.17 27.37-107.328-22.08-37.219-70.19-49.488-107.32-27.391m-8.84-237.441c-18.94-30.731-59.12-40.371-89.81-21.5-225.05 138.336-568.216 178.41-834.466 97.59-34.527-10.434-70.996 9.035-81.484 43.496-10.403 34.527 9.074 70.929 43.539 81.429 304.152 92.295 682.261 47.59 940.741-111.253 30.69-18.903 40.35-59.102 21.48-89.762m-102.47-228.031c-15.05-24.68-47.18-32.411-71.77-17.368-196.653 120.188-444.173 147.329-735.673 80.75-28.09-6.441-56.086 11.161-62.492 39.25-6.434 28.079 11.102 56.079 39.254 62.489 318.996 72.925 592.633 41.539 813.361-93.34 24.61-15.031 32.36-47.18 17.32-71.781M850.254 1687.68c-462.496 0-837.434-374.93-837.434-837.418 0-462.543 374.938-837.442 837.434-837.442 462.506 0 837.426 374.899 837.426 837.442 0 462.488-374.92 837.418-837.426 837.418" transform="matrix(.13333 0 0 -.13333 0 226.733)"/></svg> },
  { label: 'Apple Music', href: 'https://music.apple.com/tw/artist/krid-p/66265843',
    icon: <svg viewBox="0 0 512 512" height="16" width="16" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" clipRule="evenodd" d="M511.8 126.5c-.3-11.2-1-22.5-3-33.6-2-11.3-5.3-21.7-10.5-32-5.1-10.1-11.8-19.2-19.8-27.2S461.3 19 451.3 13.9c-10.2-5.2-20.7-8.5-32-10.5-11.1-2-22.4-2.7-33.6-3-5.1-.1-10.3-.2-15.4-.2H141.9c-5.1 0-10.3.1-15.4.2-11.2.3-22.5 1-33.6 3-11.3 2-21.7 5.3-32 10.5C50.8 19 41.6 25.7 33.7 33.7s-14.8 17-19.9 27.1C8.5 71 5.2 81.5 3.2 92.8c-2 11.1-2.7 22.4-3 33.6-.1 5.1-.2 10.3-.2 15.4v228.3c0 5.1.1 10.3.2 15.4.3 11.2 1 22.5 3 33.6 2 11.3 5.3 21.7 10.5 32 5.1 10.1 11.8 19.2 19.8 27.2s17.2 14.7 27.2 19.8c10.2 5.2 20.7 8.5 32 10.5 11.1 2 22.4 2.7 33.6 3 5.1.1 10.3.2 15.4.2H370c5.1 0 10.3-.1 15.4-.2 11.2-.3 22.5-1 33.6-3 11.3-2 21.7-5.3 32-10.5 10.1-5.1 19.3-11.8 27.2-19.8s14.7-17.2 19.8-27.2c5.2-10.2 8.5-20.7 10.5-32 2-11.1 2.7-22.4 3-33.6.1-5.1.2-10.3.2-15.4v-18.3l.3-191.6v-18.3c0-5.1-.1-10.3-.2-15.4M374.9 333c0 6.5 0 12.4-1.4 18.9-1.4 6.3-3.8 12.3-7.5 17.6-3.7 5.4-8.5 9.7-14 13-5.6 3.3-11.5 5.2-17.8 6.5-11.8 2.4-19.9 2.9-27.5 1.4-7.3-1.5-13.5-4.8-18.5-9.4-7.3-6.7-11.9-15.8-12.9-25.3-1.2-11.1 2.5-23 10.9-31.8 4.2-4.5 9.5-8 16.6-10.7 7.4-2.8 15.6-4.6 28.2-7.1 3.3-.7 6.6-1.3 9.9-2 4.4-.9 8.1-2 11.1-5.7 3.1-3.7 3.1-8.2 3.1-12.7V172.9c0-8.6-3.9-11-12.1-9.4-5.9 1.2-132.4 26.7-132.4 26.7-7.1 1.7-9.6 4.1-9.6 12.9v165c0 6.5-.3 12.4-1.7 18.9-1.4 6.3-3.8 12.3-7.5 17.6-3.7 5.4-8.5 9.7-14 13-5.6 3.4-11.5 5.3-17.8 6.6-11.8 2.4-19.9 2.9-27.5 1.4-7.3-1.5-13.5-4.9-18.5-9.5-7.3-6.7-11.6-15.8-12.6-25.3-1.2 11.1 2.2-23 10.6-31.8 4.2-4.5 9.5-8 16.6-10.7 7.4-2.8 15.6-4.6 28.2-7.1 3.3-.7 6.6-1.3 9.9-2 4.4-.9 8.1-2 11.1-5.7s3.4-8 3.4-12.5V130.5c0-2.5.2-4.2.3-5.1.6-4 2.2-7.5 5.1-9.9 2.4-2.1 5.5-3.5 9.5-4.3h.1l152.2-30.7c1.4-.2 12.4-2.2 13.6-2.3 8.2-.7 12.8 4.7 12.9 13.5z"/></svg> },
  { label: 'YouTube Music', href: 'https://music.youtube.com/channel/UCnEAOng3XE_Mb1ObbbxGAqg',
    icon: <svg viewBox="0 0 24 24" height="16" width="16" fill="currentColor" aria-hidden="true"><path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.104c-3.924 0-7.104-3.18-7.104-7.104S8.076 4.896 12 4.896s7.104 3.18 7.104 7.104-3.18 7.104-7.104 7.104zm0-13.332c-3.432 0-6.228 2.796-6.228 6.228S8.568 18.228 12 18.228s6.228-2.796 6.228-6.228S15.432 5.772 12 5.772zM9.684 15.54V8.46L15.816 12l-6.132 3.54z"/></svg> },
  { label: 'WhatsApp', href: 'https://www.whatsapp.com/channel/0029Vb6FeSm9hXF7H6qEIk3k',
    icon: <svg viewBox="0 0 512 512" height="16" width="16" fill="currentColor" aria-hidden="true"><path d="M1.1 509.4 37 378.6C14.8 340.2 3.2 296.7 3.3 252.4 3.3 113.2 116.6 0 255.8 0c67.5 0 130.9 26.3 178.6 74s73.9 111.1 73.9 178.6C508.2 391.8 394.9 505 255.8 505h-.1c-42.3 0-83.8-10.6-120.7-30.7z"/><path d="M192.7 146.9c-4.7-10.5-9.7-10.7-14.2-10.9l-12.1-.1c-4.2 0-11 1.6-16.8 7.9s-22.1 21.6-22.1 52.6 22.6 61 25.8 65.2 43.6 69.9 107.8 95.2c53.3 21 64.1 16.8 75.7 15.8 11.6-1.1 37.3-15.3 42.6-30s5.3-27.4 3.7-30-5.8-4.2-12.1-7.4-37.3-18.4-43.1-20.5-10-3.2-14.2 3.2c-4.2 6.3-16.3 20.5-20 24.7s-7.4 4.7-13.7 1.6c-6.3-3.2-26.6-9.8-50.7-31.3-18.8-16.7-31.4-37.4-35.1-43.7s-.4-9.7 2.8-12.9c2.8-2.8 6.3-7.4 9.5-11.1s4.2-6.3 6.3-10.5 1.1-7.9-.5-11.1c-1.8-3-14-34.2-19.6-46.7" fill="var(--midnight-base)" fillRule="evenodd" clipRule="evenodd"/></svg> },
  { label: 'Discord', href: 'https://discord.gg/3xmER2Gc3B',
    icon: <svg viewBox="0.02 57.8 511.92 396.3" height="16" width="16" fill="currentColor" aria-hidden="true"><path d="M433.7 91a416.5 416.5 0 0 0-105.6-33.2c-4.6 8.2-9.9 19.3-13.5 28.1-39.4-5.9-78.4-5.9-117.1 0-3.7-8.8-9.1-19.9-13.7-28.1-37.1 6.4-72.6 17.7-105.7 33.3-66.8 101-85 199.5-75.9 296.6 44.3 33.1 87.3 53.2 129.6 66.4 10.4-14.4 19.7-29.6 27.7-45.7-15.3-5.8-29.9-13-43.7-21.3 3.7-2.7 7.2-5.6 10.7-8.5 84.2 39.4 175.8 39.4 259 0 3.5 2.9 7.1 5.8 10.7 8.5-13.9 8.3-28.5 15.5-43.8 21.3 8 16 17.3 31.3 27.7 45.7 42.3-13.2 85.3-33.3 129.6-66.4 10.8-112.5-18-210.1-76-296.7M170.9 328c-25.3 0-46-23.6-46-52.4s20.3-52.4 46-52.4 46.5 23.6 46 52.4c.1 28.8-20.2 52.4-46 52.4m170.2 0c-25.3 0-46-23.6-46-52.4s20.3-52.4 46-52.4 46.5 23.6 46 52.4c0 28.8-20.3 52.4-46 52.4"/></svg> },
];

const supportsFieldSizing = CSS.supports('field-sizing', 'content');

export default function AiChat() {
  const { lang, t } = useLang();
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [input, setInput] = useState('');
  const [scrollTop, setScrollTop] = useState(0);
  const messagesRef = useRef(null);
  const inputRef = useRef(null);
  const scrollTimer = useRef(null);

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const hasMessages = messages.some(m => m.content && m.content.trim());
  const validMessages = useMemo(() => messages.filter(m => m.content && m.content.trim()), [messages]);
  const virtualScrollEnabled = validMessages.length > VIRTUAL_SCROLL_THRESHOLD;

  const saveHistory = useCallback((msgs) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs)); } catch (e) {}
  }, []);

  const autoResize = useCallback((el) => {
    if (supportsFieldSizing || !el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }, []);

  const scrollToBottom = useCallback(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  // Bei neuen Nachrichten / Streaming-Chunks ans Ende scrollen (wenn nahe unten)
  const lastMsg = messages[messages.length - 1];
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 140;
    if (nearBottom || (lastMsg && lastMsg._justAdded)) {
      const timer = setTimeout(scrollToBottom, virtualScrollEnabled ? 50 : 0);
      return () => clearTimeout(timer);
    }
  }, [messages, virtualScrollEnabled, scrollToBottom]);

  // Beim Öffnen ans Ende scrollen
  useEffect(() => {
    if (isOpen) setTimeout(scrollToBottom, 100);
  }, [isOpen, scrollToBottom]);

  const toggleChat = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) {
      if (typeof window.ensureHeaderOrb === 'function') {
        window.ensureHeaderOrb();
      } else {
        window.strandsHeaderInstance?.wake?.();
      }
      if (window.innerWidth <= 768) {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.top = `-${window.scrollY}px`;
      }
    } else {
      window.pauseHeaderOrb?.();
      window.strandsInstance?.wake?.();
      if (window.innerWidth <= 768) {
        const scrollY = document.body.style.top;
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
  };

  const clearHistory = () => {
    setMessages([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  };

  const sendMessage = async (text) => {
    const message = (text ?? input).trim();
    if (!message || isSending) return;

    setInput('');
    autoResize(inputRef.current);
    setIsSending(true);

    const userMsg = { content: message, role: 'user', timestamp: Date.now(), _justAdded: true };
    const assistantMsg = { content: '', role: 'assistant', timestamp: Date.now(), completed: false, typing: true, _justAdded: true };
    const base = [...messages, userMsg, assistantMsg];
    setMessages(base);
    saveHistory(base);

    window.strandsHeaderInstance?.setEnergy?.(1.0, 1.8);
    window.strandsHeaderInstance?.pulse?.();

    const historyForAPI = base
      .filter(m => m.content && m.content.trim() && m.completed !== false)
      .map(m => ({ role: m.role, content: m.content }));

    let fullResponse = '';
    let lastSave = Date.now();
    const patchAssistant = (patch) => {
      setMessages(prev => {
        const copy = [...prev];
        copy[copy.length - 1] = { ...copy[copy.length - 1], ...patch };
        return copy;
      });
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history: historyForAPI, lang }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = t('chat.apiError');
        try {
          errorMessage = JSON.parse(errorText).error || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (fullResponse === '') {
            patchAssistant({ content: t('chat.noResponse'), typing: false });
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '' || !line.startsWith('data: ')) continue;
          try {
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;
            const data = JSON.parse(jsonStr);
            if (data.error) {
              patchAssistant({ content: data.error, typing: false });
              break;
            }
            if (data.content) {
              fullResponse += data.content;
              patchAssistant({ content: fullResponse });
              if (Date.now() - lastSave > 1000) {
                setMessages(prev => { saveHistory(prev); return prev; });
                lastSave = Date.now();
              }
            }
            if (data.done) {
              patchAssistant({ typing: false });
              break;
            }
          } catch (e) {}
        }
      }

      if (buffer.trim().startsWith('data: ')) {
        try {
          const data = JSON.parse(buffer.trim().slice(6).trim());
          if (data.content) {
            fullResponse += data.content;
            patchAssistant({ content: fullResponse });
          }
        } catch (e) {}
      }

      if (fullResponse === '') {
        setMessages(prev => {
          const copy = [...prev];
          if (!copy[copy.length - 1].content) {
            copy[copy.length - 1] = { ...copy[copy.length - 1], content: t('chat.noResponseShort'), typing: false };
          }
          return copy;
        });
      } else {
        patchAssistant({ completed: true, typing: false });
        setMessages(prev => { saveHistory(prev); return prev; });
      }
    } catch (error) {
      patchAssistant({ content: error.message || t('chat.sendError'), typing: false });
    } finally {
      setIsSending(false);
      window.strandsHeaderInstance?.setEnergy?.(0.55, 0.9);
    }
  };

  // Virtuelles Scrollen bei >50 Nachrichten
  const virtualWindow = useMemo(() => {
    if (!virtualScrollEnabled) return { start: 0, end: validMessages.length };
    const containerHeight = messagesRef.current?.clientHeight || 500;
    const start = Math.max(0, Math.floor(scrollTop / ESTIMATED_ITEM_HEIGHT) - BUFFER);
    const visibleCount = Math.ceil(containerHeight / ESTIMATED_ITEM_HEIGHT) + BUFFER * 2;
    return { start, end: Math.min(validMessages.length, start + visibleCount) };
  }, [validMessages, virtualScrollEnabled, scrollTop]);

  const onMessagesScroll = (e) => {
    if (!virtualScrollEnabled) return;
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => setScrollTop(e.target.scrollTop), 100);
  };

  const confirmDialog = confirmOpen && (
    <div className="confirm-dialog-overlay active" id="confirm-dialog-overlay" onClick={e => { if (e.target === e.currentTarget) setConfirmOpen(false); }}>
      <div className="confirm-dialog">
        <div className="confirm-dialog-header">
          <svg className="confirm-dialog-icon" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
          <h3 className="confirm-dialog-title">{t('chat.dialogTitle')}</h3>
        </div>
        <div className="confirm-dialog-content">
          <p>{t('chat.dialogBody')}</p>
        </div>
        <div className="confirm-dialog-actions">
          <button className="confirm-dialog-btn confirm-dialog-cancel" onClick={() => setConfirmOpen(false)}>{t('chat.cancel')}</button>
          <button className="confirm-dialog-btn confirm-dialog-confirm" onClick={() => { clearHistory(); setConfirmOpen(false); }}>{t('chat.confirm')}</button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button className={`ai-chat-button${isOpen ? ' orb-hidden' : ''}`} aria-label={t('chat.buttonAria')} id="ai-chat-button" onClick={toggleChat}>
        <span className="ai-chat-bubble">ASK AI</span>
      </button>

      <div className={`ai-chat-container${isOpen ? ' active' : ''}`} id="ai-chat-container"
           onClick={e => { if (e.target === e.currentTarget) toggleChat(); }}>
        <div className="ai-chat-header">
          <div className="ai-chat-title-group">
            <div className="ai-chat-orb-header" id="ai-chat-orb-header" aria-hidden="true"></div>
            <h3>{t('chat.title')}</h3>
          </div>
          <div className="ai-chat-header-actions">
            <button className="ai-chat-clear" aria-label={t('chat.clear')} title={t('chat.clear')}
                    disabled={!hasMessages}
                    style={{ opacity: hasMessages ? 1 : 0.5, cursor: hasMessages ? 'pointer' : 'not-allowed' }}
                    onClick={() => { if (hasMessages) setConfirmOpen(true); }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </button>
            <button className="ai-chat-close" aria-label={t('chat.close')} onClick={toggleChat}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>
        </div>
        <div className="ai-chat-messages" id="ai-chat-messages" ref={messagesRef} onScroll={onMessagesScroll}>
          {!hasMessages && (
            <div className="ai-chat-empty-state" id="ai-chat-empty-state">
              <p className="ai-chat-empty-subtitle">{t('chat.ask')}</p>
              <div className="ai-chat-quick-questions">
                {QUICK_QUESTIONS.map(q => (
                  <button className="quick-question-btn" key={q.num}
                          onClick={() => { setInput(t(q.question)); sendMessage(t(q.question)); }}>
                    <span className="quick-question-num" aria-hidden="true">{q.num}</span>
                    <span>{t(q.label)}</span>
                  </button>
                ))}
              </div>
              <div className="ai-chat-music-links">
                <span className="ai-chat-music-label">{t('chat.music')}</span>
                {MUSIC_LINKS.map(link => (
                  <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label} className="ai-chat-music-link">{link.icon}</a>
                ))}
              </div>
            </div>
          )}
          {virtualScrollEnabled && virtualWindow.start > 0 && (
            <div className="virtual-scroll-spacer" style={{ height: virtualWindow.start * ESTIMATED_ITEM_HEIGHT }} />
          )}
          {validMessages.slice(virtualWindow.start, virtualWindow.end).map((msg, i) => (
            <div className={`ai-chat-row ${msg.role === 'user' ? 'mine' : 'other'}`} key={virtualWindow.start + i}>
              <div className="ai-chat-message-wrapper">
                <div className={`ai-chat-message ${msg.role === 'user' ? 'mine' : 'other'}${msg.typing ? ' typing' : ''}`}>
                  {msg.role === 'assistant'
                    ? <span dangerouslySetInnerHTML={{ __html: formatReply(msg.content || '') }} />
                    : msg.content}
                </div>
              </div>
            </div>
          ))}
          {virtualScrollEnabled && virtualWindow.end < validMessages.length && (
            <div className="virtual-scroll-spacer" style={{ height: (validMessages.length - virtualWindow.end) * ESTIMATED_ITEM_HEIGHT }} />
          )}
        </div>
        <div className="ai-chat-input-container">
          <div className="ai-chat-input-wrapper">
            <textarea className="ai-chat-input" id="ai-chat-input" ref={inputRef}
                      placeholder={t('chat.placeholder')} aria-label={t('chat.inputAria')}
                      rows="1" value={input}
                      onChange={e => { setInput(e.target.value); autoResize(e.target); }}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (e.nativeEvent.isComposing || e.keyCode === 229) return;
                          sendMessage();
                        }
                      }} />
            <button className="ai-chat-send" aria-label={t('chat.send')} disabled={isSending}
                    onClick={() => sendMessage()}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
        </div>
        {confirmDialog}
      </div>
    </>
  );
}
