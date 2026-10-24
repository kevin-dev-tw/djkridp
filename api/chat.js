const { Groq } = require('groq-sdk');

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.error('Fehler: GROQ_API_KEY Umgebungsvariable nicht gesetzt');
}

const WEBSITE_INFO = `DJKridP ist ein Multi-Genre DJ aus Osnabrück, Deutschland. Er ist ehemaliges Mitglied von Future Breeze. Seit Ende der 90er Jahre spielt er DJ-Sets in Deutschland, Kanada, Südafrika, Japan, Russland, Polen, Spanien, Italien und vielen weiteren Ländern. Er hat über 20 Jahre Erfahrung als DJ. Seine Werke umfassen Multi-Genre Sets, Future Breeze Projekte und Live Performances auf internationalen Bühnen. Kontakt: Twitch (https://www.twitch.tv/djkridp), Instagram (https://www.instagram.com/dj_krid_p), TikTok (https://www.tiktok.com/@krid_p), Facebook (https://www.facebook.com/djkridp/), WhatsApp (https://www.whatsapp.com/channel/0029Vb6FeSm9hXF7H6qEIk3k), Discord (https://discord.gg/3xmER2Gc3B), Spotify (https://open.spotify.com/user/eluw6nthyi6sd3wjcydx6rojx), StreamElements (https://streamelements.com/djkridp/tip).`;

const LANG_CONFIG = {
  de: {
    style: 'Antworte immer auf natürlichem, flüssigem Hochdeutsch in klaren, vollständigen Sätzen.',
    respond: 'Antworte auf Deutsch',
    offTopic: 'Entschuldigung, ich kann nur Fragen zu den Informationen auf dieser Website beantworten. Bitte fragen Sie etwas über DJKridP, seine Karriere, Werke oder Kontaktinformationen.',
    emptyMsg: 'Nachricht darf nicht leer sein'
  },
  en: {
    style: 'Always reply in natural, fluent English in clear, complete sentences.',
    respond: 'Answer in English',
    offTopic: 'Sorry, I can only answer questions about the information on this website. Please ask something about DJKridP, his career, works, or contact information.',
    emptyMsg: 'Message must not be empty'
  },
  ja: {
    style: '常に自然で流暢な日本語で、明確で完全な文で回答してください。',
    respond: '日本語で回答してください',
    offTopic: '申し訳ありませんが、このウェブサイトの情報に関する質問のみお答えできます。DJKridP、彼のキャリア、作品、または連絡先についてお尋ねください。',
    emptyMsg: 'メッセージは空にできません'
  }
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'GROQ_API_KEY Umgebungsvariable nicht gesetzt' });
  }

  const groq = new Groq({
    apiKey: GROQ_API_KEY
  });

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }
    const { message, history = [], lang = 'de' } = body || {};
    const L = LANG_CONFIG[lang] || LANG_CONFIG.de;

    if (!message) {
      res.write(`data: ${JSON.stringify({ error: L.emptyMsg })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      return res.end();
    }

    const systemPrompt = `Du bist ein hilfsbereiter Assistent für die DJKridP Website.

${L.style}

Du kannst NUR folgende Formatierungen verwenden:

**Listen:**
- Verwende "- " am Zeilenanfang für Aufzählungslisten
- Verwende "1. " am Zeilenanfang für nummerierte Listen

**Links:**
- URLs werden automatisch als anklickbare Links dargestellt

WICHTIG: 
- Verwende KEINE Markdown-Formatierungen wie **, *, \`, >, # usw.
- Schreibe in normalem Fließtext mit Absätzen
- Verwende nur Listen wenn mehrere Punkte aufgezählt werden
- Halte die Sprache natürlich und gesprächig`;

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
};
