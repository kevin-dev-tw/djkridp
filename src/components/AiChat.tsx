import { useState, useEffect, useRef, useCallback, useMemo, type UIEvent, type ChangeEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useLang, type TranslationKey } from '../i18n';
import { formatReply } from '../lib/formatReply';

const API_URL = '/api/chat';
const STORAGE_KEY = 'ai_chat_history';
const VIRTUAL_SCROLL_THRESHOLD = 50;
const ESTIMATED_ITEM_HEIGHT = 80;
const BUFFER = 5;

interface Message {
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  completed?: boolean;
  typing?: boolean;
  _justAdded?: boolean;
}

const QUICK_QUESTIONS: { num: string; label: TranslationKey; question: TranslationKey }[] = [
  { num: '01', label: 'chat.q1', question: 'chat.q1q' },
  { num: '02', label: 'chat.q2', question: 'chat.q2q' },
  { num: '03', label: 'chat.q3', question: 'chat.q3q' },
  { num: '04', label: 'chat.q4', question: 'chat.q4q' },
];


const supportsFieldSizing = CSS.supports('field-sizing', 'content');

export default function AiChat() {
  const { lang, t } = useLang();
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [input, setInput] = useState('');
  const [scrollTop, setScrollTop] = useState(0);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) as Message[] : [];
    } catch {
      return [];
    }
  });

  const hasMessages = messages.some(m => m.content && m.content.trim());
  const validMessages = useMemo(() => messages.filter(m => m.content && m.content.trim()), [messages]);
  const virtualScrollEnabled = validMessages.length > VIRTUAL_SCROLL_THRESHOLD;

  const saveHistory = useCallback((msgs: Message[]) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs)); } catch {}
  }, []);

  const autoResize = useCallback((el: HTMLTextAreaElement | null) => {
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
        window.smoother?.paused?.(true);
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.top = `-${window.scrollY}px`;
      }
    } else {
      window.pauseHeaderOrb?.();
      window.strandsInstance?.wake?.();
      if (window.innerWidth <= 768) {
        window.smoother?.paused?.(false);
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

  const sendMessage = async (text?: string) => {
    const message = (text ?? input).trim();
    if (!message || isSending) return;

    setInput('');
    autoResize(inputRef.current);
    setIsSending(true);

    const userMsg: Message = { content: message, role: 'user', timestamp: Date.now(), _justAdded: true };
    const assistantMsg: Message = { content: '', role: 'assistant', timestamp: Date.now(), completed: false, typing: true, _justAdded: true };
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
    const patchAssistant = (patch: Partial<Message>) => {
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
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      if (!response.body) throw new Error(t('chat.noResponse'));

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
          } catch {}
        }
      }

      if (buffer.trim().startsWith('data: ')) {
        try {
          const data = JSON.parse(buffer.trim().slice(6).trim());
          if (data.content) {
            fullResponse += data.content;
            patchAssistant({ content: fullResponse });
          }
        } catch {}
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
      patchAssistant({ content: error instanceof Error ? error.message : t('chat.sendError'), typing: false });
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

  const onMessagesScroll = (e: UIEvent<HTMLDivElement>) => {
    if (!virtualScrollEnabled) return;
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    const top = e.currentTarget.scrollTop;
    scrollTimer.current = setTimeout(() => setScrollTop(top), 100);
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
              <div className="ai-chat-row other ai-chat-greeting">
                <div className="ai-chat-message-wrapper">
                  <div className="ai-chat-message other">{t('chat.greeting')}</div>
                </div>
              </div>
              <div className="quick-questions-panel">
                <div className="ai-chat-quick-questions">
                  {QUICK_QUESTIONS.map(q => (
                    <button className="quick-question-btn" key={q.num}
                            onClick={() => { setInput(t(q.question)); sendMessage(t(q.question)); }}>
                      <span>{t(q.label)}</span>
                    </button>
                  ))}
                </div>
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
                      rows={1} value={input}
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
