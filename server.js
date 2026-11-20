const express = require('express');
const cors = require('cors');
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

if (!process.env.GROQ_API_KEY) {
  console.warn('Warnung: GROQ_API_KEY nicht gefunden. KI-Chat-Funktion ist lokal deaktiviert.');
}

// Gleiche Handler wie die Vercel Serverless Functions — keine doppelte Logik
app.get('/api/twitch-schedule', require('./api/twitch-schedule'));
app.post('/api/chat', require('./api/chat'));


app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
