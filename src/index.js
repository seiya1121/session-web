import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import createFinalStore from './scripts/store';
import App from './scripts/app';
import './styles/index.css';

const store = createFinalStore();

ReactDOM.render(
  <Provider store={store}><App /></Provider>,
  document.getElementById('root')
);
