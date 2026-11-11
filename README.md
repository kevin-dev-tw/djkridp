# DJKridP 官方網站

DJKridP 的官方網站 — 單頁海報式設計（Acid Poster），展示其作為多流派 DJ 的職業生涯、演出國家、作品與 Twitch 直播資訊。

線上：https://djkridp.vercel.app/

## 技術棧

- HTML5 / CSS3（原生 CSS，設計 token 集中於 `css/variables.css`）
- 原生 JavaScript + GSAP（ScrollSmoother / ScrollTrigger）
- Vercel serverless functions（`api/`）
- 本地開發：Express（`server.js`）

## 功能

- 德文 / 英文雙語（`js/i18n.js`，`data-i18n` 切換）
- Twitch 直播行程表：由 Twitch Helix API 即時取得（`/api/twitch-schedule`），無資料時整個區塊隱藏
- Twitch 直播狀態指示（DecAPI 輪詢）
- AI 聊天助理（`/api/chat`，由 Groq 驅動）
- Spotify / SoundCloud / Twitch 播放器嵌入（lazy-load）
- Service Worker 離線快取（只快取靜態資源，不快取 API）
- `sitemap.xml` + `robots.txt`

## 頁面結構

單頁，所有內容都在 `index.html`：
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
- 禁止：漸層、圓角膠囊、玻璃擬態、陰影光暈、純黑白、3D/WebGL
- 動畫僅限 `transform` 與 `opacity`，並提供 `prefers-reduced-motion` 降級

**CSS 工作流程**：樣式唯一來源是 `css/` 目錄（`variables`、`global`、`components`、`responsive`、`footer`）。修改後執行 `npm run build` 將其注入 `index.html` 的 inline 區塊 — 不要直接編輯 inline CSS。

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
node server.js   # http://localhost:3000
```

`server.js` 提供靜態檔案並鏡像兩個 API 路由（`/api/chat`、`/api/twitch-schedule`），行為與 Vercel serverless functions 一致。

## 部署

推送 `main` 分支至 GitHub，Vercel 自動建置部署：

1. Vercel 專案設定 → Environment Variables，加入上表中的變數（Production / Preview / Development 全勾）
2. Build command 為 `npm run build`（`vercel.json` 已設定）
3. 重新部署

若部署後 Streams 區塊未顯示，先檢查 `https://djkridp.vercel.app/api/twitch-schedule` 是否回傳資料 — 通常是環境變數未設定。
