const MARQUEE_TEXT = 'Come On And Play The Music Loud DJKridP live On Twitch';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-marquee" aria-hidden="true">
        <span className="footer-marquee-content">
          <span className="footer-marquee-text">{MARQUEE_TEXT}</span>
          <span className="footer-marquee-text">{MARQUEE_TEXT}</span>
        </span>
      </div>
      <div className="footer-wordmark-wrap" aria-hidden="true">
        <span className="footer-wordmark">DJKridP</span>
      </div>
    </footer>
  );
}
