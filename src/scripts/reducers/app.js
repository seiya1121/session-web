import * as App from '../constants/app';

const initialState = {
  commentText: '',
};

const app = (state = initialState, action) => {
  // const comments = [].concat(state.comments)
  switch (action.type) {
    case App.CHANGE_TEXT:
      return Object.assign({}, state, {commentText: action.text});
    default:
      return state;
  }
}

export default app;
