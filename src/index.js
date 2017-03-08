import React from 'react';
import ReactDOM from 'react-dom';
import { combineReducers, createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import App from './components/app.jsx';
import createLogger from 'redux-logger';
// Reducers
import app from './reducers/app';
import comments from './reducers/comments';

const logger = createLogger();

const reducer = combineReducers({ app, comments });

const store = createStore(
  reducer,
  applyMiddleware(logger)
);

ReactDOM.render(
  <Provider store={store}><App /></Provider>,
  document.getElementById('root')
);
