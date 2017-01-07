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
  commentText: '',
  displayName: '',
  mailAddressForSignUp: '',
  passwordForSignUp: '',
  mailAddressForSignIn: '',
  passwordForSignIn: '',
  searchText: '',
  volume: 0.8,
  played: 0,
  loaded: 0,
  seeking: false,
};

const app = (state = initialState, action) => {
  switch (action.type) {
    case App.CHANGE_TEXT:
      return Object.assign({}, state, { [action.textType]: action.text })
    case App.SET_PLAYING_VIDEO:
      return Object.assign({}, state, {
        playing: true,
        startTime: 0,
        playingVideo: action.video,
        que: state.que.filter((item) => item.key !== action.video.key),
        comments: [...state.comments, action.comment],
      })
    case App.SET_USER:
      return Object.assign({}, state, {
        currentUser: { name: action.name, photoURL: action.photoURL, isLogin: action.isLogin }
      })
    case App.SET_QUE:
      return Object.assign({}, state, { que: [...state.que, action.video] })
    case App.DELETE_QUE:
      return Object.assign({}, state, { que: state.que.filter((q) => q.key !== action.video.key) })
    case App.PLAY_PAUSE:
      return Object.assign({}, state, { playing: !state.playing, startTime: state.played })
    case App.SET_VOLUME:
      return Object.assign({}, state, { volume: parseFloat(action.volume) })
    case App.SEEK_DOWN:
      return Object.assign({}, state, { seeking: true })
    case App.SEEK_UP:
      return Object.assign({}, state, { seeking: false, startTime: action.played })
    case App.CHANGE_PLAYED:
      return Object.assign({}, state, { played: action.played })
    case App.PLAYING_ON:
      return Object.assign({}, state, { playing: true })
    default:
      return state;
  }
}

export default app;
