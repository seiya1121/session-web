import * as App from '../constants/app';
import { getAnimalName } from '../animal.js';

const defaultCurrentUser = Object.assign(
  {}, { name: getAnimalName(), photoURL: '', isLogin: false }
);
const initialState = {
  currentUser: defaultCurrentUser,
  text: {
    commentText: '',
    displayName: '',
    mailAddressForSignUp: '',
    passwordForSignUp: '',
    mailAddressForSignIn: '',
    passwordForSignIn: '',
    searchText: '',
  },
  searchResult: [],
  comments: [],
  que: [],
  playingVideo: {},
  playing: true,
  startTime: 0,
  playerStatus: {
    volume: 0.8,
    played: 0,
    loaded: 0,
    seeking: false,
  }
};

const app = (state = initialState, action) => {
  switch (action.type) {
    case App.CHANGE_TEXT:
      return Object.assign({}, state, {[state.text[action.textType]]: action.text});
    case App.SET_PLAYING_VIDEO:
      return Object.assign({}, state, {[state.text[action.textType]]: action.text});
    default:
      return state;
  }
}

export default app;
