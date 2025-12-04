import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './src/index.css';

console.log('HireRevOps App Loading...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Could not find root element to mount to");
  throw new Error("Could not find root element to mount to");
}

console.log('Root element found, rendering app...');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('HireRevOps App Rendered!');