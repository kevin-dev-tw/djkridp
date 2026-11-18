import React from 'react';
import { createRoot } from 'react-dom/client';
import '../css/index.css';
import { LangProvider } from './i18n.jsx';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LangProvider>
      <App />
    </LangProvider>
  </React.StrictMode>
);
