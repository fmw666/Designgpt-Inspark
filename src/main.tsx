import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './i18n';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <Router>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </Router>
);
