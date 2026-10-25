const express = require('express');
const cors = require('cors');
const { Groq } = require('groq-sdk');
const path = require('path');
const fs = require('fs');

// Lokale .env-Datei parsen, falls vorhanden
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim().replace(/^["'](.*)["']$/, '$1');
          if (key && !process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    });
    console.log('✅ Lokale .env erfolgreich geladen');
  } catch (err) {
    console.warn('⚠️ Warnung beim Lesen der .env:', err.message);
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// PWA Manifest Unterstützung
app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json');
  res.sendFile(path.join(__dirname, 'images', 'site.webmanifest'));
});

// Service Worker Unterstützung
app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'sw.js'));
});

// PWA Icon Unterstützung
app.get('/images/web-app-manifest-192x192.png', (req, res) => {
  res.sendFile(path.join(__dirname, 'images', 'web-app-manifest-192x192.png'));
});

app.get('/images/web-app-manifest-512x512.png', (req, res) => {
  res.sendFile(path.join(__dirname, 'images', 'web-app-manifest-512x512.png'));
});

const GROQ_API_KEY = process.env.GROQ_API_KEY;

let groq = null;
if (!GROQ_API_KEY) {
  console.warn('⚠️ Warnung: GROQ_API_KEY nicht gefunden. KI-Chat-Funktion ist lokal deaktiviert.');
} else {
  groq = new Groq({
    apiKey: GROQ_API_KEY
  });
}

const WEBSITE_INFO = `DJKridP ist ein Multi-Genre DJ aus Osnabrück, Deutschland. Er ist ehemaliges Mitglied von Future Breeze. Seit Ende der 90er Jahre spielt er DJ-Sets in Deutschland, Kanada, Südafrika, Japan, Russland, Polen, Spanien, Italien und vielen weiteren Ländern. Er hat über 20 Jahre Erfahrung als DJ. Seine Werke umfassen Multi-Genre Sets, Future Breeze Projekte und Live Performances auf internationalen Bühnen. Kontakt: Twitch (https://www.twitch.tv/djkridp), Instagram (https://www.instagram.com/dj_krid_p), TikTok (https://www.tiktok.com/@krid_p), Facebook (https://www.facebook.com/djkridp/), WhatsApp (https://www.whatsapp.com/channel/0029Vb6FeSm9hXF7H6qEIk3k), Discord (https://discord.gg/3xmER2Gc3B), Spotify (https://open.spotify.com/user/eluw6nthyi6sd3wjcydx6rojx), StreamElements (https://streamelements.com/djkridp/tip).`;

const LANG_CONFIG = {
  de: {
    style: 'Antworte immer auf natürlichem, flüssigem Hochdeutsch, so wie eine echte Person sprechen würde: vollständige Sätze, kurze Absätze, höflich aber locker.',
    respond: 'Antworte auf Deutsch',
    offTopic: 'Entschuldigung, ich kann nur Fragen zu den Informationen auf dieser Website beantworten. Bitte fragen Sie etwas über DJKridP, seine Karriere, Werke oder Kontaktinformationen.',
    emptyMsg: 'Nachricht darf nicht leer sein'
  },
  en: {
    style: 'Always reply in natural, fluent English, the way a real person would speak: complete sentences, short paragraphs, polite but casual.',
    respond: 'Answer in English',
    offTopic: 'Sorry, I can only answer questions about the information on this website. Please ask something about DJKridP, his career, works, or contact information.',
    emptyMsg: 'Message must not be empty'
  },
  ja: {
    style: '常に自然で流暢な日本語で、実際の人が話すように回答してください。完全な文、短い段落、丁寧ですが気楽な文体で。',
    respond: '日本語で回答してください',
    offTopic: '申し訳ありませんが、このウェブサイトの情報に関する質問のみお答えできます。DJKridP、彼のキャリア、作品、または連絡先についてお尋ねください。',
    emptyMsg: 'メッセージは空にできません'
  }
};

app.post('/api/chat', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    if (!groq) {
      res.write(`data: ${JSON.stringify({ error: 'GROQ_API_KEY nicht konfiguriert' })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      return res.end();
    }

    const { message, history = [], lang = 'de' } = req.body;
    const L = LANG_CONFIG[lang] || LANG_CONFIG.de;

    if (!message) {
      res.write(`data: ${JSON.stringify({ error: L.emptyMsg })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      return res.end();
    }

    const systemPrompt = `Du bist ein hilfsbereiter Assistent für die DJKridP Website.

${L.style}

Verwende KEINE Markdown-Syntax und keine * Zeichen. Wenn Aufzählungen wirklich hilfreich sind, verwende Bindestriche (-) oder Nummern, aber nur sparsam – der Text soll sich in erster Linie wie eine natürliche Antwort lesen.`;

    const messages = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];

    if (history && history.length > 0) {
      const recentHistory = history.slice(-5);
      recentHistory.forEach(msg => {
        if (msg.content && msg.content.trim() && msg.role === 'assistant') {
          messages.push({
            role: 'assistant',
            content: msg.content
          });
        }
      });
    }

    const userQuestion = `Du kennst folgende Informationen über DJKridP: ${WEBSITE_INFO}

Benutzerfrage: ${message}

${L.respond} und verwende die obigen Informationen über DJKridP, um die Frage zu beantworten. Wenn die Frage nicht über DJKridP ist, antworte: "${L.offTopic}"`;

    messages.push({
      role: 'user',
      content: userQuestion
    });

    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: 'openai/gpt-oss-120b',
      temperature: 0.2,
      max_completion_tokens: 1024,
      top_p: 0.8,
      stream: true,
      stop: null
    });

    let hasContent = false;
    for await (const chunk of chatCompletion) {
      let content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        hasContent = true;
        content = content.replace(/\*/g, '-');
        content = content.replace(/^\*\s+/gm, '- ');
        content = content.replace(/\*\*\*/g, '---');
        content = content.replace(/\*\*/g, '');
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    if (!hasContent) {
      res.write(`data: ${JSON.stringify({ error: 'Keine Antwort vom AI-Modell erhalten' })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Groq API Fehler:', error);
    const errorMessage = error.message || 'Ein Fehler ist im AI-Service aufgetreten';
    console.error('Fehlerdetails:', errorMessage);
    res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
