import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

window.serverAddress = '/';
window.email = null;

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
