// Scrollbar-Track ausblenden aber Griff beibehalten
document.addEventListener('DOMContentLoaded', () => {
  // Stile erstellen zum Ausblenden des Tracks aber Beibehalten des Griffs
  const forceHideTrackKeepThumbStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
      /* Track ausblenden aber Griff beibehalten - höchste Priorität */
      ::-webkit-scrollbar {
        width: 8px !important;
        height: 8px !important;
        background: transparent !important;
      }
      
      ::-webkit-scrollbar-track {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        outline: none !important;
        -webkit-appearance: none !important;
        appearance: none !important;
        color: transparent !important;
        visibility: hidden !important;
      }
      
      ::-webkit-scrollbar-track-piece {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        outline: none !important;
        -webkit-appearance: none !important;
        appearance: none !important;
        color: transparent !important;
        visibility: hidden !important;
      }
      
      ::-webkit-scrollbar-track-piece:start,
      ::-webkit-scrollbar-track-piece:end {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        outline: none !important;
        -webkit-appearance: none !important;
        appearance: none !important;
        color: transparent !important;
        visibility: hidden !important;
      }
      
      ::-webkit-scrollbar-corner {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        outline: none !important;
        color: transparent !important;
        visibility: hidden !important;
      }
      
      ::-webkit-scrollbar-button {
        background: transparent !important;
        height: 0 !important;
        width: 0 !important;
        display: none !important;
        visibility: hidden !important;
        border: none !important;
      }
      
      /* Scrollbar-Griff beibehalten - erzwingen Sichtbarkeit */
      ::-webkit-scrollbar-thumb {
        background: var(--color-purple-primary) !important;
        border-radius: 2px !important;
        border: none !important;
        outline: none !important;
        transition: all 0.3s ease !important;
        -webkit-appearance: none !important;
        appearance: none !important;
        visibility: visible !important;
        display: block !important;
        opacity: 1 !important;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: var(--color-purple-dark) !important;
      }
      
      ::-webkit-scrollbar-thumb:active {
        background: var(--color-purple-darker) !important;
      }
      
      /* Alle Webkit-Elemente - Track ausblenden erzwingen */
      *::-webkit-scrollbar-track {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        outline: none !important;
        -webkit-appearance: none !important;
        appearance: none !important;
        color: transparent !important;
        visibility: hidden !important;
      }
      
      *::-webkit-scrollbar-track-piece {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        outline: none !important;
        -webkit-appearance: none !important;
        appearance: none !important;
        color: transparent !important;
        visibility: hidden !important;
      }
      
      /* Firefox - Track ausblenden aber Griff beibehalten */
      html {
        scrollbar-width: thin !important;
        scrollbar-color: var(--color-purple-primary) transparent !important;
      }
      
      /* Erzwungenes Ausblenden für spezifische Elemente */
      body::-webkit-scrollbar-track {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        outline: none !important;
        -webkit-appearance: none !important;
        appearance: none !important;
        color: transparent !important;
        visibility: hidden !important;
      }
      
      main::-webkit-scrollbar-track {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        outline: none !important;
        -webkit-appearance: none !important;
        appearance: none !important;
        color: transparent !important;
        visibility: hidden !important;
      }
      
      section::-webkit-scrollbar-track {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        outline: none !important;
        -webkit-appearance: none !important;
        appearance: none !important;
        color: transparent !important;
        visibility: hidden !important;
      }
      
      div::-webkit-scrollbar-track {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        outline: none !important;
        -webkit-appearance: none !important;
        appearance: none !important;
        color: transparent !important;
        visibility: hidden !important;
      }
      
      /* Sicherstellen, dass Scroll-Funktion normal funktioniert */
      body {
        overflow-y: auto !important;
        overflow-x: hidden !important;
      }
      
      html {
        overflow-y: auto !important;
        overflow-x: hidden !important;
      }
      
      /* Responsive Anpassungen */
      @media (max-width: 768px) {
        ::-webkit-scrollbar {
          width: 4px !important;
          height: 4px !important;
        }
        
        ::-webkit-scrollbar-thumb {
          border-radius: 2px !important;
        }
      }
    `;
    
    // Am Anfang von head einfügen für höchste Priorität
    document.head.insertBefore(style, document.head.firstChild);
  };

  // Sofort ausführen
  forceHideTrackKeepThumbStyles();

  // Mehrfach verzögert ausführen um sicherzustellen, dass alle anderen Stile überschrieben werden
  setTimeout(forceHideTrackKeepThumbStyles, 50);
  setTimeout(forceHideTrackKeepThumbStyles, 100);
  setTimeout(forceHideTrackKeepThumbStyles, 200);
  setTimeout(forceHideTrackKeepThumbStyles, 500);
  
  // DOM-Änderungen überwachen
  const observer = new MutationObserver(() => {
    forceHideTrackKeepThumbStyles();
  });
  
  observer.observe(document.head, {
    childList: true,
    subtree: true
  });

  // Scroll-Ereignisse überwachen um sicherzustellen, dass Funktion normal funktioniert
  let isScrolling = false;
  window.addEventListener('scroll', () => {
    if (!isScrolling) {
      isScrolling = true;
      // Scroll-Funktion funktioniert normal
      setTimeout(() => {
        isScrolling = false;
      }, 100);
    }
  });

  // Regelmäßig prüfen und Stile neu anwenden
  setInterval(() => {
    forceHideTrackKeepThumbStyles();
  }, 1000);

  console.log('Skript zum Ausblenden von Scrollbar-Tracks geladen, Griff beibehalten');
});
