// Rendert Text als Zeichen-Spans mit Maske — React-Ersatz für DOM-SplitText.
// Leerzeichen bleiben echte Spaces (Zeilenumbruch-fähig), Buchstaben bekommen .char-mask>.char.
export default function CharSplit({ text }) {
  return (
    <>
      {(text || '').split('').map((ch, i) =>
        ch === ' ' ? ' ' : (
          <span className="char-mask" key={i}>
            <span className="char">{ch}</span>
          </span>
        )
      )}
    </>
  );
}
