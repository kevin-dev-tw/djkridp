// Markdown-ähnliche Formatierung für AI-Chat-Antworten (1:1 aus ai-chat.js portiert)

function formatHeadings(text: string): string {
  return text.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, content) => {
    const level = hashes.length;
    return `<h${level}>${content}</h${level}>`;
  });
}

function formatBoldItalic(text: string): string {
  let formatted = text.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/__(.+?)__/g, '<strong>$1</strong>');
  formatted = formatted.replace(/--(.+?)--/g, '<strong>$1</strong>');
  formatted = formatted.replace(/~~(.+?)~~/g, '<del>$1</del>');
  formatted = formatted.replace(/==(.+?)==/g, '<mark>$1</mark>');

  formatted = formatted.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
  formatted = formatted.replace(/(?<![\w_])_(?!_)(.+?)(?<!_)_(?![\w])/g, '<em>$1</em>');

  return formatted;
}

function formatTables(text: string): string {
  const lines = text.split('\n');
  const result: string[] = [];
  let i = 0;

  const isRow = (line: string) => /^\s*\|.+\|\s*$/.test(line);
  const isSeparator = (line: string) => /^\s*\|?[\s:|-]+\|?\s*$/.test(line) && line.includes('-');
  const splitRow = (line: string) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());

  while (i < lines.length) {
    if (isRow(lines[i]) && i + 1 < lines.length && isSeparator(lines[i + 1])) {
      const header = splitRow(lines[i]);
      i += 2;
      const rows: string[][] = [];
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

function formatBlockquotes(text: string): string {
  const lines = text.split('\n');
  let inBlockquote = false;
  const result: string[] = [];

  for (const line of lines) {
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

function formatLists(text: string): string {
  const lines = text.split('\n');
  let inUl = false;
  let inOl = false;
  const result: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === '') {
      if (inUl || inOl) {
        continue;
      }
      result.push(line);
      continue;
    }

    const ulMatch = trimmed.match(/^(?:[-*•–—]|--)\s+(.+)/);
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
      const item = ulMatch[1].replace(/^\[ \]\s*/, '□ ').replace(/^\[[xX✓]\]\s*/, '■ ');
      result.push(`<li>${item}</li>`);
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

export function linkify(text: string): string {
  const platforms: Record<string, { name: string }> = {
    'twitch.tv': { name: 'Twitch' },
    'instagram.com': { name: 'Instagram' },
    'tiktok.com': { name: 'TikTok' },
    'facebook.com': { name: 'Facebook' },
    'spotify.com': { name: 'Spotify' },
    'discord.gg': { name: 'Discord' },
    'whatsapp.com': { name: 'WhatsApp' },
    'streamelements.com': { name: 'StreamElements' }
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
          return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="ai-platform-link">${label}</a>` + suffix;
        }
      }

      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="ai-chat-link">${url}</a>` + suffix;
    } catch (e) {
      return match;
    }
  });
}

export function formatText(text: string): { html: string; codes: string[] } {
  if (!text) return { html: '', codes: [] };

  let formatted = text;
  const codes: string[] = [];

  formatted = formatted.replace(/&/g, '&amp;');
  formatted = formatted.replace(/</g, '&lt;');
  formatted = formatted.replace(/>/g, '&gt;');

  formatted = formatted.replace(/```([\s\S]*?)```/g, (match, code) => {
    codes.push(`<pre><code>${code.replace(/\r\n?/g, '\n').trim()}</code></pre>`);
    return `@@CODE${codes.length - 1}@@`;
  });
  formatted = formatted.replace(/`([^`\n]+)`/g, (match, code) => {
    codes.push(`<code>${code}</code>`);
    return `@@CODE${codes.length - 1}@@`;
  });

  formatted = formatted.replace(/!\[([^\]\n]*)\]\((https?:\/\/[^)\s<>'"]+)\)/g, (match, alt) => {
    codes.push(`Bild: ${alt || 'Bild'}`);
    return `@@CODE${codes.length - 1}@@`;
  });

  formatted = formatted.replace(/\[([^\]\n]+)\]\((https?:\/\/[^)\s<>'"]+)\)/g, (match, label, url) => {
    codes.push(`<a href="${url}" target="_blank" rel="noopener noreferrer" class="ai-chat-link">${label}</a>`);
    return `@@CODE${codes.length - 1}@@`;
  });

  formatted = formatted.replace(/\r\n/g, '\n');
  formatted = formatted.replace(/\r/g, '\n');
  formatted = formatted.replace(/\n{3,}/g, '\n\n');

  formatted = formatHeadings(formatted);
  formatted = formatTables(formatted);
  formatted = formatBoldItalic(formatted);
  formatted = formatBlockquotes(formatted);
  formatted = formatLists(formatted);

  formatted = formatted.replace(/^\s*([-*_])(?:\s*\1){2,}\s*$/gm, '<hr>');
  formatted = formatted.replace(/^\s*=+\s*$/gm, '');

  formatted = formatted.replace(/\n/g, '<br>');

  return { html: formatted, codes };
}

export function formatReply(text: string): string {
  const { html, codes } = formatText(text);
  return linkify(html).replace(/@@CODE(\d+)@@/g, (match, i) => codes[Number(i)]);
}
