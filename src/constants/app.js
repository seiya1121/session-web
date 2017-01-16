import { getAnimalName } from '../scripts/animal.js';

export const DefaultUser = Object.assign(
  {},
  { name: getAnimalName(), photoURL: '', isLogin: false }
);

export const InitialState = {
  currentUser: DefaultUser,
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
  duration: 0,
  seeking: false,
  isSearchActive: false,
};

export const CHANGE_VALUE_WITH_KEY = 'CHANGE_VALUE_WITH_KEY';
export const CHANGE_TEXT = 'CHANGE_TEXT';
export const CHANGE_SEARCH_TEXT = 'CHANGE_SEARCH_TEXT';
export const SET_PLAYING_VIDEO = 'SET_PLAYING_VIDEO';
export const SET_USER = 'SET_USER';
export const ADD_VIDEO = 'ADD_VIDEO';
export const DELETE_VIDEO = 'DELETE_VIDEO';
export const PLAY_PAUSE = 'PLAY_PAUSE';
export const CHANGE_VOLUME = 'CHANGE_VOLUME';
export const SEEK_DOWN = 'SEEK_DOWN';
export const SEEK_UP = 'SEEK_UP';
export const CHANGE_PLAYED = 'CHANGE_PLAYED';
export const PLAY = 'PLAY';
export const PAUSE = 'PAUSE';
export const PROGRESS = 'PROGRESS';
export const SET_DEFAULT_USER = 'SET_DEFAULT_USER';
export const ADD_COMMENT = 'ADD_COMMENT';
export const SET_SEARCH_RESULT = 'SET_SEARCH_RESULT';
export const FETCH_SYNC_STATE = 'FETCH_SYNC_STATE';
export const UPDATE_QUE = 'UPDATE_QUE';
export const UPDATE_COMMENTS = 'UPDATE_COMMENTS';
