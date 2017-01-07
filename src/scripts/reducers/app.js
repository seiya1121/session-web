import * as App from '../constants/app';
import { getAnimalName } from '../animal.js';

const defaultUser = Object.assign({}, { name: getAnimalName(), photoURL: '', isLogin: false });

const initialState = {
  currentUser: defaultUser,
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
  const newState = (obj) => Object.assign({}, state, obj);
  switch (action.type) {
    case App.CHANGE_TEXT:
      return newState({ [action.textType]: action.text })
    case App.SET_PLAYING_VIDEO:
      return newState({
        playing: true,
        startTime: 0,
        playingVideo: action.video,
        que: state.que.filter((item) => item.key !== action.video.key),
      })
    case App.SET_USER:
      return newState({ currentUser: action.user })
    case App.SET_DEFAULT_USER:
      return newState({ currentUser: defaultUser })
    case App.SET_QUE:
      return newState({ que: [...state.que, action.video] })
    case App.DELETE_QUE:
      return newState({ que: state.que.filter((q) => q.key !== action.video.key) })
    case App.PLAY_PAUSE:
      return newState({ playing: !state.playing, startTime: state.played })
    case App.SET_VOLUME:
      return newState({ volume: parseFloat(action.volume) })
    case App.SEEK_DOWN:
      return newState({ seeking: true })
    case App.SEEK_UP:
      return newState({ seeking: false, startTime: action.played })
    case App.CHANGE_PLAYED:
      return newState({ played: action.played, seekin: false })
    case App.PLAY:
      return newState({ playing: true })
    case App.PAUSE:
      return newState({ playing: false })
    case App.PROGRESS:
      return !state.seeking ? newState(action.playingStatus) : state
    case App.SET_COMMENT:
      return newState({ comments: [...state.comments, action.comment], commentText: '' })
    case App.SET_SEARCH_RESULT:
      return newState({searchResult: action.result})
    default:
      return state;
  }
}

export default app;
