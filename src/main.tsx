import React from 'react';
import { createRoot } from 'react-dom/client';
import '../css/index.css';
import { LangProvider } from './i18n';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LangProvider>
      <App />
    </LangProvider>
  </React.StrictMode>
);
