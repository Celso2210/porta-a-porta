// Ensure window.fetch is writable before any polyfills or modules attempt to set it
(function() {
  try {
    if (typeof window !== 'undefined') {
      var origFetch = window.fetch;
      var currentFetch = origFetch;
      Object.defineProperty(window, 'fetch', {
        get: function() {
          return currentFetch;
        },
        set: function(val) {
          currentFetch = val;
        },
        configurable: true,
        enumerable: true
      });
      if (typeof (window as any).global === 'undefined') {
        (window as any).global = window;
      }
    }
  } catch (e) {
    // Ignore error if property already defined or reconfigured
  }
})();

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
