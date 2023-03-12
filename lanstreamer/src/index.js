import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { Reducers } from './Store';
import './index.scss';
import './Animations.scss';

window.developmentMode = false;
window.demo = false;

window.whatIsLanstreamer = 'https://lanstreamer.com';
window.localhost = './';
window.server = 'https://lanstreamer.com:5000/api/';
// window.server = 'https://localhost:7081/api/';
window.previewParts = 1;
window.previewClipDuration = 9.5;
window.googleClientId = '634057223675-m245q453mcmhga710vc85asdfi9j74mg.apps.googleusercontent.com';

window.posterChangeTimeout = undefined;

const store = createStore(
  Reducers,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

ReactDOM.render(
  <React.StrictMode>
    <Provider store={ store }>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
