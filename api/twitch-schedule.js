// Twitch Helix — Get Channel Stream Schedule
// https://dev.twitch.tv/docs/api/schedule/
// Benötigt: TWITCH_CLIENT_ID + TWITCH_CLIENT_SECRET (Twitch Dev Console App)

const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const CHANNEL = (process.env.TWITCH_CHANNEL || 'djkridp').toLowerCase();

let tokenCache = { token: null, expiresAt: 0 };
const userIdCache = {};

async function getAppToken() {
  const now = Date.now();
  if (tokenCache.token && tokenCache.expiresAt > now + 60 * 1000) {
    return tokenCache.token;
  }
  const res = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'client_credentials'
    })
  });
  if (!res.ok) throw new Error(`Twitch token request failed: ${res.status}`);
  const data = await res.json();
  tokenCache = {
    token: data.access_token,
    expiresAt: now + (data.expires_in || 0) * 1000
  };
  return tokenCache.token;
}

async function helix(path, token) {
  const res = await fetch(`https://api.twitch.tv/helix${path}`, {
    headers: {
      'Client-ID': CLIENT_ID,
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Helix ${path} failed: ${res.status} ${body.slice(0, 200)}`);
  }
  return res.json();
}

async function getBroadcasterId(login, token) {
  if (userIdCache[login]) return userIdCache[login];
  const data = await helix(`/users?login=${encodeURIComponent(login)}`, token);
  const user = data.data && data.data[0];
  if (!user) throw new Error(`Twitch user not found: ${login}`);
  userIdCache[login] = user.id;
  return user.id;
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    return res.status(200).end();
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  if (!CLIENT_ID || !CLIENT_SECRET) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).json({ error: 'not_configured' });
  }

  try {
    const token = await getAppToken();
    const broadcasterId = await getBroadcasterId(CHANNEL, token);
    const data = await helix(`/schedule?broadcaster_id=${broadcasterId}&first=25`, token);

    const now = Date.now();
    const segments = (data.data && data.data.segments || [])
      .map(s => ({
        id: s.id,
        title: s.title || '',
        start: s.start_time,
        end: s.end_time,
        category: s.category ? s.category.name : null,
        recurring: !!s.is_recurring,
        canceled: !!(s.canceled_until && new Date(s.canceled_until).getTime() > new Date(s.start_time).getTime())
      }))
      .filter(s => new Date(s.end).getTime() > now);

    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    res.status(200).json({
      channel: data.data ? data.data.broadcaster_login : CHANNEL,
      vacation: data.data && data.data.vacation ? {
        start: data.data.vacation.start_time,
        end: data.data.vacation.end_time
      } : null,
      segments
    });
  } catch (err) {
    console.error('Twitch schedule error:', err.message);
    res.setHeader('Cache-Control', 'no-store');
    res.status(502).json({ error: 'twitch_api_error' });
  }
};
