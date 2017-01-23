import React from 'react';
import ReactDOM from 'react-dom';
import { combineReducers, compose, createStore } from 'redux';
import { Provider } from 'react-redux';
import app from './reducers/app';
import App from './components/app.jsx';

const rootReducer = combineReducers({ app });

const createFinalCreateStore = () => {
  const finalCreateStore = compose()(createStore);
  return finalCreateStore(rootReducer);
};

const store = createFinalCreateStore();

ReactDOM.render(
  <Provider store={store}><App /></Provider>,
  document.getElementById('root')
);
