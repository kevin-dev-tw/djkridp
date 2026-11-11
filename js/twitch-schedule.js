// Twitch Streamplan — rendert kommende Segmente aus /api/twitch-schedule
class TwitchSchedule {
    constructor() {
        this.container = document.getElementById('streams');
        this.list = document.getElementById('twitch-schedule-list');
        this.state = null;
        if (!this.container || !this.list) return;
        this.fetchSchedule();
        document.addEventListener('langchange', () => this.render());
    }

    tr(key, fallback) {
        return (typeof window.t === 'function') ? window.t(key) : fallback;
    }

    locale() {
        try {
            const lang = localStorage.getItem('djkridp_lang') || 'de';
            return lang === 'en' ? 'en-GB' : 'de-DE';
        } catch (e) {
            return 'de-DE';
        }
    }

    async fetchSchedule() {
        try {
            const res = await fetch('/api/twitch-schedule');
            if (!res.ok) return; // nicht konfiguriert oder API-Fehler → Bereich bleibt versteckt
            this.state = await res.json();
            this.render();
        } catch (err) {
            // Netzwerkfehler → Bereich versteckt lassen
        }
    }

    fmtDate(d) {
        return new Intl.DateTimeFormat(this.locale(), { weekday: 'short', day: 'numeric', month: 'short' }).format(d);
    }

    fmtTime(d) {
        return new Intl.DateTimeFormat(this.locale(), { hour: '2-digit', minute: '2-digit' }).format(d);
    }

    render() {
        if (!this.state) return;
        const { segments, vacation } = this.state;

        if ((!segments || segments.length === 0) && !vacation) {
            this.container.hidden = true;
            return;
        }

        const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

        let html = '';
        if (vacation) {
            const until = this.fmtDate(new Date(vacation.end));
            html += `<li class="twitch-schedule-vacation">${esc(this.tr('twitch.scheduleVacation', `Streampause bis ${until}`)).replace('{date}', esc(until))}</li>`;
        }

        const nextId = (segments || []).find(s => !s.canceled)?.id;
        (segments || []).slice(0, 8).forEach(s => {
            const start = new Date(s.start);
            const end = new Date(s.end);
            const title = s.title || this.tr('twitch.scheduleUntitled', 'Live-Stream');
            html += `<li class="twitch-schedule-item${s.canceled ? ' is-canceled' : ''}${s.id === nextId ? ' is-next' : ''}">
                <span class="twitch-schedule-date">${esc(this.fmtDate(start))}</span>
                <span class="twitch-schedule-time">${esc(this.fmtTime(start))}–${esc(this.fmtTime(end))}</span>
                <span class="twitch-schedule-title">${esc(title)}${s.category ? ` <span class="twitch-schedule-cat">${esc(s.category)}</span>` : ''}</span>
                ${s.canceled ? `<span class="twitch-schedule-badge">${esc(this.tr('twitch.scheduleCanceled', 'Abgesagt'))}</span>` : ''}
            </li>`;
        });

        if (!html) {
            this.container.hidden = true;
            return;
        }

        this.list.innerHTML = html;
        this.container.hidden = false;
        // Sektion war beim Setup versteckt → ScrollTrigger-Positionen neu messen (Titel-Scrub etc.)
        if (typeof ScrollTrigger !== 'undefined' && typeof ScrollTrigger.refresh === 'function') {
            requestAnimationFrame(() => ScrollTrigger.refresh());
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TwitchSchedule();
});
