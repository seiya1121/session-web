import * as App from '../constants/app';
import { getAnimalName } from '../animal.js';

const defaultCurrentUser = Object.assign(
  {}, { name: getAnimalName(), photoURL: '', isLogin: false }
);
const initialState = {
  currentUser: defaultCurrentUser,
  searchResult: [],
  comments: [],
  que: [],
  playingVideo: {},
  playing: true,
  startTime: 0,
  text: {
    commentText: '',
    displayName: '',
    mailAddressForSignUp: '',
    passwordForSignUp: '',
    mailAddressForSignIn: '',
    passwordForSignIn: '',
    searchText: '',
  },
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
      return Object.assign({}, state, {
        playing: true,
        startTime: 0,
        playingVideo: action.video,
        que: state.que.filter((item) => item.key !== action.video.key),
        comments: [...state.comments, action.comment],
      })
    default:
      return state;
  }
}

export default app;
