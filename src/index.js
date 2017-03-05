import React from 'react';
import ReactDOM from 'react-dom';
import { combineReducers, createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import app from './reducers/app';
import App from './components/app.jsx';
import createLogger from 'redux-logger';

const logger = createLogger();

const reducer = combineReducers({ app });

const store = createStore(
  reducer,
  applyMiddleware(logger)
);

ReactDOM.render(
  <Provider store={store}><App /></Provider>,
  document.getElementById('root')
);
