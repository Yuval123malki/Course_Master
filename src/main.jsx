import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import 'katex/dist/katex.min.css';
import './styles/index.css';

// Dynamically load legacy-viz.js if not already present
if (!window.VIZ) {
  const script = document.createElement('script');
  script.src = '/legacy-viz.js';
  script.defer = true;
  document.head.appendChild(script);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
