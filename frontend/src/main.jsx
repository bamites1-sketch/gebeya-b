import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './i18n';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: '10px', background: '#1f2937', color: '#fff', fontSize: '14px' },
          success: { style: { background: '#078930' } },
          error: { style: { background: '#DA121A' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);