document.addEventListener('DOMContentLoaded', () => {
  const chatButton = document.getElementById('ai-chat-button');
  const chatContainer = document.getElementById('ai-chat-container');
  const chatClose = document.getElementById('ai-chat-close');
  const chatClear = document.getElementById('ai-chat-clear');
  const chatMessages = document.getElementById('ai-chat-messages');
  const chatInput = document.getElementById('ai-chat-input');
  const chatSend = document.getElementById('ai-chat-send');
  const confirmDialogOverlay = document.getElementById('confirm-dialog-overlay');
  const confirmDialogCancel = document.getElementById('confirm-dialog-cancel');
  const confirmDialogConfirm = document.getElementById('confirm-dialog-confirm');
  const emptyState = document.getElementById('ai-chat-empty-state');

  const API_URL = '/api/chat';

  const STORAGE_KEY = 'ai_chat_history';

  let isOpen = false;
  let isSending = false;
  let messageHistory = [];
  let virtualScrollEnabled = false;
  const VIRTUAL_SCROLL_THRESHOLD = 50;

  function autoResizeTextarea(el) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }

  function toggleChat() {
    isOpen = !isOpen;
    if (isOpen) {
      chatContainer.classList.add('active');
      chatButton.style.display = 'none';
      
      // Hintergrund-Scrolling nur auf mobilen Geräten sperren
      if (window.innerWidth <= 768) {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.top = `-${window.scrollY}px`;
      }
    } else {
      chatContainer.classList.remove('active');
      chatButton.style.display = 'flex';
      
      // Hintergrund-Scrolling-Sperre nur auf mobilen Geräten aufheben
      if (window.innerWidth <= 768) {
        const scrollY = document.body.style.top;
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
  }

  function saveHistory() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messageHistory));
    } catch (e) {
      console.error('Fehler beim Speichern der Historie:', e);
    }
  }

  function loadHistory() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        messageHistory = JSON.parse(saved);
        return true;
      }
    } catch (e) {
      console.error('Fehler beim Laden der Historie:', e);
    }
    return false;
  }

  function updateEmptyState() {
    const hasMessages = messageHistory.length > 0 && messageHistory.some(msg => msg.content && msg.content.trim());
    if (emptyState) {
      if (hasMessages) {
        emptyState.classList.add('hidden');
      } else {
        emptyState.classList.remove('hidden');
      }
    }
    
    // Löschen-Button-Status aktualisieren
    if (chatClear) {
      chatClear.disabled = !hasMessages;
      chatClear.style.opacity = hasMessages ? '1' : '0.5';
      chatClear.style.cursor = hasMessages ? 'pointer' : 'not-allowed';
    }
  }

  function clearHistory() {
    messageHistory = [];
    localStorage.removeItem(STORAGE_KEY);
    const rows = chatMessages.querySelectorAll('.ai-chat-row');
    rows.forEach(row => row.remove());
    updateEmptyState();
  }

  function formatText(text) {
    if (!text) return { html: '', codes: [] };

    let formatted = text;
    const codes = [];

    // HTML escapen, bevor eigene Tags erzeugt werden
    formatted = formatted.replace(/&/g, '&amp;');
    formatted = formatted.replace(/</g, '&lt;');
    formatted = formatted.replace(/>/g, '&gt;');

    // Code-Blöcke und Inline-Code als Platzhalter extrahieren,
    // damit nachfolgende Formatierungen ihren Inhalt nicht verändern
    formatted = formatted.replace(/```([\s\S]*?)```/g, (match, code) => {
      codes.push(`<pre><code>${code.replace(/\r\n?/g, '\n').trim()}</code></pre>`);
      return `@@CODE${codes.length - 1}@@`;
    });
    formatted = formatted.replace(/`([^`\n]+)`/g, (match, code) => {
      codes.push(`<code>${code}</code>`);
      return `@@CODE${codes.length - 1}@@`;
    });

    // Markdown-Links [text](url) extrahieren
    formatted = formatted.replace(/\[([^\]\n]+)\]\((https?:\/\/[^)\s<>'"]+)\)/g, (match, label, url) => {
      codes.push(`<a href="${url}" target="_blank" rel="noopener noreferrer" class="ai-chat-link">${label}</a>`);
      return `@@CODE${codes.length - 1}@@`;
    });

    // Zeilenumbrüche verarbeiten
    formatted = formatted.replace(/\r\n/g, '\n');
    formatted = formatted.replace(/\r/g, '\n');
    formatted = formatted.replace(/\n{3,}/g, '\n\n');

    // Überschriften verarbeiten
    formatted = formatHeadings(formatted);

    // Tabellen verarbeiten
    formatted = formatTables(formatted);

    // Fett- und Kursiv-Text verarbeiten
    formatted = formatBoldItalic(formatted);

    // Blockquotes verarbeiten
    formatted = formatBlockquotes(formatted);

    // Listen verarbeiten
    formatted = formatLists(formatted);

    // Horizontale Linien verarbeiten (---, ***, ___)
    formatted = formatted.replace(/^\s*([-*_])(?:\s*\1){2,}\s*$/gm, '<hr>');

    // Zeilenumbrüche verarbeiten
    formatted = formatted.replace(/\n/g, '<br>');

    return { html: formatted, codes };
  }

  function formatReply(text) {
    const { html, codes } = formatText(text);
    // Code-Platzhalter erst nach dem Verlinken zurücksetzen,
    // damit URLs im Code nicht zu Links werden
    return linkify(html).replace(/@@CODE(\d+)@@/g, (match, i) => codes[Number(i)]);
  }

  function formatHeadings(text) {
    // Überschriften # ## ### etc. verarbeiten
    return text.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, content) => {
      const level = hashes.length;
      return `<h${level}>${content}</h${level}>`;
    });
  }

  function formatBoldItalic(text) {
    // Fett-Text **text** oder __text__ verarbeiten
    let formatted = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/__(.+?)__/g, '<strong>$1</strong>');
    
    // Kursiv-Text *text* oder _text_ verarbeiten (Konflikte mit Fett vermeiden)
    formatted = formatted.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
    // Unterstrich-Kursiv nur an Wortgrenzen, damit URLs wie dj_krid_p nicht zerstört werden
    formatted = formatted.replace(/(?<![\w_])_(?!_)(.+?)(?<!_)_(?![\w])/g, '<em>$1</em>');
    
    return formatted;
  }

  function formatTables(text) {
    const lines = text.split('\n');
    const result = [];
    let i = 0;

    const isRow = (line) => /^\s*\|.+\|\s*$/.test(line);
    const isSeparator = (line) => /^\s*\|?[\s:|-]+\|?\s*$/.test(line) && line.includes('-');
    const splitRow = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());

    while (i < lines.length) {
      if (isRow(lines[i]) && i + 1 < lines.length && isSeparator(lines[i + 1])) {
        const header = splitRow(lines[i]);
        i += 2;
        const rows = [];
        while (i < lines.length && isRow(lines[i])) {
          rows.push(splitRow(lines[i]));
          i += 1;
        }
        let table = '<table><thead><tr>' + header.map((cell) => `<th>${cell}</th>`).join('') + '</tr></thead><tbody>';
        table += rows.map((row) => '<tr>' + row.map((cell) => `<td>${cell}</td>`).join('')).join('');
        result.push(table + '</tbody></table>');
      } else {
        result.push(lines[i]);
        i += 1;
      }
    }

    return result.join('\n');
  }

  function formatBlockquotes(text) {
    const lines = text.split('\n');
    let inBlockquote = false;
    let result = [];

    for (let line of lines) {
      // '>' wurde beim HTML-Escapen zu '&gt;'
      if (line.startsWith('&gt; ')) {
        if (!inBlockquote) {
          result.push('<blockquote>');
          inBlockquote = true;
        }
        result.push(`<p>${line.substring(5)}</p>`);
      } else {
        if (inBlockquote) {
          result.push('</blockquote>');
          inBlockquote = false;
        }
        result.push(line);
      }
    }
    
    if (inBlockquote) {
      result.push('</blockquote>');
    }
    
    return result.join('\n');
  }

  function formatLists(text) {
    const lines = text.split('\n');
    let inUl = false;
    let inOl = false;
    let result = [];
    
    for (let line of lines) {
      const trimmed = line.trim();

      // Leerzeilen innerhalb einer Liste ignorieren, Liste nicht unterbrechen
      if (trimmed === '') {
        if (inUl || inOl) {
          continue;
        }
        result.push(line);
        continue;
      }

      const ulMatch = trimmed.match(/^[-*•]\s+(.+)/);
      const olMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
      
      if (ulMatch) {
        if (inOl) {
          result.push('</ol>');
          inOl = false;
        }
        if (!inUl) {
          result.push('<ul>');
          inUl = true;
        }
        result.push(`<li>${ulMatch[1]}</li>`);
      } else if (olMatch) {
        if (inUl) {
          result.push('</ul>');
          inUl = false;
        }
        if (!inOl) {
          result.push('<ol>');
          inOl = true;
        }
        result.push(`<li>${olMatch[2]}</li>`);
      } else {
        if (inUl) {
          result.push('</ul>');
          inUl = false;
        }
        if (inOl) {
          result.push('</ol>');
          inOl = false;
        }
        result.push(line);
      }
    }
    
    if (inUl) result.push('</ul>');
    if (inOl) result.push('</ol>');
    
    return result.join('\n');
  }

  function linkify(text) {
    const platforms = {
      'twitch.tv': { name: 'Twitch', icon: 'live_tv' },
      'instagram.com': { name: 'Instagram', icon: 'photo_camera' },
      'tiktok.com': { name: 'TikTok', icon: 'music_note' },
      'facebook.com': { name: 'Facebook', icon: 'groups' },
      'spotify.com': { name: 'Spotify', icon: 'library_music' },
      'discord.gg': { name: 'Discord', icon: 'forum' },
      'whatsapp.com': { name: 'WhatsApp', icon: 'chat' },
      'streamelements.com': { name: 'StreamElements', icon: 'paid' }
    };

    const urlRegex = /\b(https?:\/\/[^\s<>"']+\b)/g;
    return text.replace(urlRegex, (match) => {
      let url = match;
      let suffix = '';
      const punctMatch = match.match(/[.,!?;:]+$/);
      if (punctMatch) {
        suffix = punctMatch[0];
        url = match.slice(0, match.length - suffix.length);
      }

      // Überflüssigen Schrägstrich am Ende entfernen (z. B. example.com/kontakt/)
      if (url.endsWith('/') && url.length > 'https://a'.length) {
        url = url.slice(0, -1);
      }
      
      if (url.length < 10) {
        return match;
      }
      
      if (!url.includes('.') && !url.includes('/')) {
        return match;
      }
      
      try {
        const urlObj = new URL(url);
        if (!urlObj.hostname || urlObj.hostname.length < 3) {
          return match;
        }

        // Plattformen mit sichtbarem Account-Namen in der URL
        const handlePlatforms = new Set(['twitch.tv', 'instagram.com', 'tiktok.com', 'facebook.com', 'streamelements.com']);

        for (const [domain, info] of Object.entries(platforms)) {
          if (url.includes(domain)) {
            let label = info.name;
            if (handlePlatforms.has(domain)) {
              const handle = urlObj.pathname.split('/').filter(Boolean)[0];
              if (handle && handle.length <= 30) {
                label = handle;
              }
            }
            const link = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="ai-platform-link">${label}</a>`;
            return link + suffix;
          }
        }

        const link = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="ai-chat-link">${url}</a>`;
        return link + suffix;
      } catch (e) {
        return match;
      }
    });
  }

  function addMessage(content, role, saveToHistory = true) {
    const row = document.createElement('div');
    row.className = `ai-chat-row ${role === 'user' ? 'mine' : 'other'}`;
    
    const messageWrapper = document.createElement('div');
    messageWrapper.className = 'ai-chat-message-wrapper';
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-chat-message ${role === 'user' ? 'mine' : 'other'}`;
    
    if (role === 'assistant') {
      messageDiv.innerHTML = formatReply(content);
    } else {
      messageDiv.textContent = content;
    }
    
    messageWrapper.appendChild(messageDiv);
    
    row.appendChild(messageWrapper);
    
    chatMessages.appendChild(row);
    
    if (!virtualScrollEnabled) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    } else {
      setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 50);
    }

    if (saveToHistory && content.trim()) {
      messageHistory.push({ content, role, timestamp: Date.now() });
      saveHistory();
      
      if (messageHistory.length > VIRTUAL_SCROLL_THRESHOLD && !virtualScrollEnabled) {
        virtualScrollEnabled = true;
        renderHistory();
        setupVirtualScroll();
      }
    }

    updateEmptyState();
    return messageDiv;
  }

  function updateMessage(messageDiv, content) {
    messageDiv.innerHTML = formatReply(content);
    if (!virtualScrollEnabled) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    } else {
      const isNearBottom = chatMessages.scrollHeight - chatMessages.scrollTop - chatMessages.clientHeight < 100;
      if (isNearBottom) {
        setTimeout(() => {
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 50);
      }
    }
  }

  async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message || isSending) return;

    chatInput.value = '';
    autoResizeTextarea(chatInput);
    isSending = true;
    chatSend.disabled = true;

    addMessage(message, 'user');

    const assistantMessageDiv = addMessage('', 'assistant', false);
    assistantMessageDiv.classList.add('typing');
    let fullResponse = '';
    const assistantHistoryIndex = messageHistory.length;
    messageHistory.push({ content: '', role: 'assistant', timestamp: Date.now(), completed: false });
    let lastSaveTime = Date.now();
    const SAVE_INTERVAL = 1000;

    try {
      console.log('Sende Nachricht an:', API_URL);
      const historyForAPI = messageHistory
        .filter(msg => msg.content && msg.content.trim() && msg.completed !== false)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, history: historyForAPI }),
      });
      console.log('Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'API-Anfrage fehlgeschlagen';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
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
          if (fullResponse === '' && !assistantMessageDiv.textContent) {
            assistantMessageDiv.innerHTML = linkify('Keine Antwort erhalten. Bitte versuchen Sie es erneut.');
            assistantMessageDiv.classList.remove('typing');
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6).trim();
              if (!jsonStr) continue;
              const data = JSON.parse(jsonStr);
              if (data.error) {
                assistantMessageDiv.innerHTML = formatReply(data.error);
                assistantMessageDiv.classList.remove('typing');
                break;
              }
              if (data.content) {
                fullResponse += data.content;
                updateMessage(assistantMessageDiv, fullResponse);
                if (messageHistory[assistantHistoryIndex]) {
                  messageHistory[assistantHistoryIndex].content = fullResponse;
                  const now = Date.now();
                  if (now - lastSaveTime > SAVE_INTERVAL) {
                    saveHistory();
                    lastSaveTime = now;
                  }
                }
              }
              if (data.done) {
                assistantMessageDiv.classList.remove('typing');
                if (fullResponse === '') {
                  assistantMessageDiv.innerHTML = linkify('Keine Antwort erhalten.');
                }
                break;
              }
            } catch (e) {
              console.error('Parsing-Fehler:', e, 'Line:', line);
            }
          }
        }
      }

      if (buffer.trim()) {
        const remainingLine = buffer.trim();
        if (remainingLine.startsWith('data: ')) {
          try {
            const data = JSON.parse(remainingLine.slice(6).trim());
            if (data.content) {
              fullResponse += data.content;
              updateMessage(assistantMessageDiv, fullResponse);
            }
          } catch (e) {
            console.error('Parsing-Fehler (buffer):', e);
          }
        }
      }

      if (fullResponse === '' && assistantMessageDiv.classList.contains('typing')) {
        assistantMessageDiv.innerHTML = linkify('Keine Antwort erhalten. Bitte versuchen Sie es erneut.');
        assistantMessageDiv.classList.remove('typing');
        messageHistory.pop();
      } else if (fullResponse) {
        if (messageHistory[assistantHistoryIndex]) {
          messageHistory[assistantHistoryIndex].content = fullResponse;
          messageHistory[assistantHistoryIndex].completed = true;
        }
        saveHistory();
      }
      updateEmptyState();
    } catch (error) {
      console.error('Fehler beim Senden der Nachricht:', error);
      const errorMessage = error.message || 'Entschuldigung, ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
      assistantMessageDiv.innerHTML = formatReply(errorMessage);
      assistantMessageDiv.classList.remove('typing');
      if (messageHistory[assistantHistoryIndex]) {
        messageHistory.pop();
      }
      updateEmptyState();
    } finally {
      isSending = false;
      chatSend.disabled = false;
    }
  }

  function renderHistory() {
    const rows = chatMessages.querySelectorAll('.ai-chat-row');
    rows.forEach(row => row.remove());
    if (messageHistory.length > VIRTUAL_SCROLL_THRESHOLD) {
      virtualScrollEnabled = true;
      renderVirtualScroll();
    } else {
      virtualScrollEnabled = false;
      messageHistory.forEach(msg => {
        if (msg.content && msg.content.trim()) {
          addMessage(msg.content, msg.role, false);
        }
      });
    }
    updateEmptyState();
  }

  function renderVirtualScroll() {
    const container = chatMessages;
    const validMessages = messageHistory.filter(msg => msg.content && msg.content.trim());
    
    if (validMessages.length <= VIRTUAL_SCROLL_THRESHOLD) {
      virtualScrollEnabled = false;
      const rows = container.querySelectorAll('.ai-chat-row');
      rows.forEach(row => row.remove());
      validMessages.forEach(msg => {
        addMessage(msg.content, msg.role, false);
      });
      updateEmptyState();
      return;
    }

    const containerHeight = container.clientHeight || 500;
    const scrollTop = container.scrollTop;
    const estimatedItemHeight = 80;
    const buffer = 5;
    
    const startIndex = Math.max(0, Math.floor(scrollTop / estimatedItemHeight) - buffer);
    const visibleCount = Math.ceil(containerHeight / estimatedItemHeight) + (buffer * 2);
    const endIndex = Math.min(validMessages.length, startIndex + visibleCount);

    const rows = container.querySelectorAll('.ai-chat-row, .virtual-scroll-spacer');
    rows.forEach(row => row.remove());
    
    if (startIndex > 0) {
      const topSpacer = document.createElement('div');
      topSpacer.className = 'virtual-scroll-spacer';
      topSpacer.style.height = `${startIndex * estimatedItemHeight}px`;
      container.appendChild(topSpacer);
    }

    for (let i = startIndex; i < endIndex; i++) {
      const msg = validMessages[i];
      if (msg.content && msg.content.trim()) {
        addMessage(msg.content, msg.role, false);
      }
    }

    if (endIndex < validMessages.length) {
      const bottomSpacer = document.createElement('div');
      bottomSpacer.className = 'virtual-scroll-spacer';
      bottomSpacer.style.height = `${(validMessages.length - endIndex) * estimatedItemHeight}px`;
      container.appendChild(bottomSpacer);
    }
    
    updateEmptyState();
  }

  let scrollTimeout = null;
  function setupVirtualScroll() {
    if (scrollTimeout) {
      chatMessages.removeEventListener('scroll', handleVirtualScroll);
    }
    
    function handleVirtualScroll(e) {
      if (!virtualScrollEnabled) return;
      
      // e.stopPropagation() entfernen um normale Scroll-Ereignis-Propagation zu erlauben
      
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      scrollTimeout = setTimeout(() => {
        renderVirtualScroll();
      }, 100);
    }
    
    chatMessages.addEventListener('scroll', handleVirtualScroll, { passive: true });
    
    // stopPropagation() für touchmove und wheel-Ereignisse entfernen
  }

  function showConfirmDialog(callback) {
    confirmDialogOverlay.classList.add('active');
    const handleConfirm = () => {
      confirmDialogOverlay.classList.remove('active');
      callback();
      cleanup();
    };
    const handleCancel = () => {
      confirmDialogOverlay.classList.remove('active');
      cleanup();
    };
    const handleOverlayClick = (e) => {
      if (e.target === confirmDialogOverlay) {
        handleCancel();
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };
    const cleanup = () => {
      confirmDialogConfirm.removeEventListener('click', handleConfirm);
      confirmDialogCancel.removeEventListener('click', handleCancel);
      confirmDialogOverlay.removeEventListener('click', handleOverlayClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
    confirmDialogConfirm.addEventListener('click', handleConfirm);
    confirmDialogCancel.addEventListener('click', handleCancel);
    confirmDialogOverlay.addEventListener('click', handleOverlayClick);
    document.addEventListener('keydown', handleKeyDown);
  }

  chatButton.addEventListener('click', toggleChat);
  chatClose.addEventListener('click', toggleChat);
  chatClear.addEventListener('click', () => {
    const hasMessages = messageHistory.length > 0 && messageHistory.some(msg => msg.content && msg.content.trim());
    if (hasMessages) {
      showConfirmDialog(() => {
        clearHistory();
      });
    }
  });

  chatSend.addEventListener('click', sendMessage);

  chatInput.addEventListener('input', (e) => {
    autoResizeTextarea(e.target);
  });

  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  autoResizeTextarea(chatInput);

  if (loadHistory()) {
    renderHistory();
    if (virtualScrollEnabled) {
      setupVirtualScroll();
      setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 100);
    }
  } else {
    updateEmptyState();
  }

  setupVirtualScroll();

  chatContainer.addEventListener('click', (e) => {
    if (e.target === chatContainer) {
      toggleChat();
    }
  });

  const quickQuestionBtns = document.querySelectorAll('.quick-question-btn');
  quickQuestionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const question = btn.getAttribute('data-question');
      if (question) {
        chatInput.value = question;
        autoResizeTextarea(chatInput);
        sendMessage();
      }
    });
  });
});
