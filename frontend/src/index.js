import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from "./providers/auth";
import { BrowserRouter } from "react-router-dom";
import App from './App';
import './index.scss';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AuthProvider>
);