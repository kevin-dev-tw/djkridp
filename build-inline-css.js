// Bettet css/*.css der Reihe nach in den INLINE-CSS-Markerblock von index.html ein
// Verwendung: nach Änderungen an css/*.css `node build-inline-css.js` ausführen
const fs = require('fs');
const path = require('path');

const FILES = ['variables', 'global', 'components', 'responsive', 'footer'];
const START = '<!-- INLINE-CSS:START -->';
const END = '<!-- INLINE-CSS:END -->';

const htmlPath = path.join(__dirname, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const i = html.indexOf(START);
const j = html.indexOf(END);
if (i === -1 || j === -1 || j < i) {
  console.error('找不到 INLINE-CSS 標記，請確認 index.html 包含 START/END');
  process.exit(1);
}

const blocks = FILES.map(f => {
  const css = fs.readFileSync(path.join(__dirname, 'css', `${f}.css`), 'utf8').trim();
  return `<style>\n/* css/${f}.css */\n${css}\n</style>`;
}).join('\n');

fs.writeFileSync(htmlPath, html.slice(0, i) + START + '\n' + blocks + '\n' + html.slice(j));
console.log(`已內嵌 ${FILES.length} 個 CSS 檔案至 index.html`);
