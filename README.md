# DJKridP 官方網站

DJKridP 的官方網站 — 單頁海報式設計（Acid Poster），展示其作為多流派 DJ 的職業生涯、演出國家、作品與 Twitch 直播資訊。

線上：https://djkridp.vercel.app/

## 技術棧

- React 18 + TypeScript + Vite（`src/`）
- Tailwind CSS 4（`css/tailwind.css` 透過 `@theme inline` 橋接自訂 token）
- 原生 CSS token 集中於 `css/variables.css`，由 `css/index.css` 統一匯入
- GSAP（ScrollSmoother / ScrollTrigger）+ 自製 WebGL orb 特效
- Vercel serverless functions（`api/`）
- 本地開發：Express（`server.js`）

## 功能

- 德文 / 英文雙語（`src/i18n.tsx`）
- 淺色 / 深色主題切換（Sky Toggle，跟隨系統 + localStorage 記憶）
- Twitch 直播行程表：由 Twitch Helix API 即時取得（`/api/twitch-schedule`），無資料時整個區塊隱藏
- Twitch 直播狀態指示（DecAPI 輪詢）
- AI 聊天助理（`/api/chat`，由 Groq 驅動，SSE 串流、保留對話上下文）
- Spotify / SoundCloud / Twitch 播放器嵌入（lazy-load）
- Service Worker 離線快取（只快取靜態資源，不快取 API）
- `sitemap.xml` + `robots.txt` + `llms.txt`

## 頁面結構

單頁，所有內容都在 `src/App.tsx`：
- Home（首頁 hero）
- Über mich（關於）
- Tours（演出國家清單）
- Streams（Twitch 直播行程，有資料才顯示）
- Werke（作品 + 嵌入播放器）
- Kontakt（聯絡 / 社群連結）

## 設計規範

設計系統定義於 `DESIGN.md`（Acid Poster — 已鎖定）：
- 唯一強調色：Hazard Amber `#FFB13D`
- 字體：Archivo Black（標題）/ Hanken Grotesk（內文）/ JetBrains Mono（中繼資料）
- 三套字體皆以 woff2 本地託管於 `public/fonts/`（不呼叫 Google Fonts CDN）
- 禁止：漸層、圓角膠囊、玻璃擬態、陰影光暈、純黑白、3D/WebGL（orb 特效除外）
- 動畫僅限 `transform` 與 `opacity`，並提供 `prefers-reduced-motion` 降級

**CSS 工作流程**：樣式唯一來源是 `css/` 目錄（`variables`、`global`、`components`、`responsive`、`footer`、`tailwind`），由 `src/main.tsx` 透過 `css/index.css` 匯入並經 Vite 打包。直接修改 `css/` 內的檔案即可。

## 環境變數

在 `.env`（本地）與 Vercel Environment Variables（線上）設定：

| 變數 | 用途 |
|------|------|
| `GROQ_API_KEY` | AI 聊天（必需，否則聊天回報未設定） |
| `TWITCH_CLIENT_ID` | Twitch 排程 API（必需） |
| `TWITCH_CLIENT_SECRET` | Twitch 排程 API（必需） |
| `TWITCH_CHANNEL` | 頻道名稱，預設 `djkridp`（可選） |

`.env` 已在 `.gitignore` 中，不會提交。

## 本地開發

```bash
npm install
node server.js   # API 伺服器 http://localhost:3000
npm run dev      # Vite 開發伺服器 http://localhost:5173（/api 代理到 3000）
```

`server.js` 直接掛載 `api/` 下的 handler（`/api/chat`、`/api/twitch-schedule`），行為與 Vercel serverless functions 一致，無重複實作。

## 部署

推送 `main` 分支至 GitHub，Vercel 自動建置部署：

1. Vercel 專案設定 → Environment Variables，加入上表中的變數（Production / Preview / Development 全勾）
2. Build command 為 `npm run build`（`vercel.json` 已設定）
3. 重新部署

若部署後 Streams 區塊未顯示，先檢查 `https://djkridp.vercel.app/api/twitch-schedule` 是否回傳資料 — 通常是環境變數未設定。
