import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './context/ThemeContext'
import axios from 'axios';

// Set Axios default base URL dynamically for production deployments
const isProd = import.meta.env.PROD;
axios.defaults.baseURL = import.meta.env.VITE_API_URL || (isProd ? '/_/backend' : '');


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)

