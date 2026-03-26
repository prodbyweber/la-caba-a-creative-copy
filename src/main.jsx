import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// Hide splash screen once React has painted
requestAnimationFrame(() => {
  setTimeout(() => {
    if (window.__hideSplash) window.__hideSplash();
  }, 300);
});