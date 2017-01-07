import { compose, createStore } from 'redux';
import rootReducer from './rootReducer';

const createFinalStore = () => {
  const finalCreateStore = compose()(createStore);
  return finalCreateStore(rootReducer);
}

export default createFinalStore
