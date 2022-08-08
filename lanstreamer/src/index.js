import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { Reducers } from './Store';
import './index.scss';
import './Animations.scss';

window.developmentMode = false;
window.demo = true;

// window.server = 'http://192.168.1.197:5555/';
// window.localhost = 'http://192.168.1.197:5555/';

window.localhost = './';
window.server = './';
window.previewParts = 1;
window.previewClipDuration = 9.5;

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
