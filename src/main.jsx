import React from 'react';
import { createRoot } from 'react-dom/client';
import '../css/variables.css';
import '../css/global.css';
import '../css/components.css';
import '../css/responsive.css';
import '../css/footer.css';
import { LangProvider } from './i18n.jsx';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LangProvider>
      <App />
    </LangProvider>
  </React.StrictMode>
);
