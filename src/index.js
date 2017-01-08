import React from 'react';
import ReactDOM from 'react-dom';
import { combineReducers, compose } from 'redux';
import { Provider } from 'react-redux';
import './config/ReactotronConfig'
import Reactotron from 'reactotron-react-js'
import app from './reducers/app';
import App from './components/app.jsx';
import './styles/index.css';

const rootReducer = combineReducers({app});
const store = Reactotron.createStore(rootReducer, compose())

ReactDOM.render(
  <Provider store={store}><App /></Provider>,
  document.getElementById('root')
);
