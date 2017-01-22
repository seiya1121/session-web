import { getAnimalName } from '../scripts/animal.js';

export const DefaultUser = Object.assign(
  {},
  { name: getAnimalName(), photoURL: '', accessToken: '', uid: '' }
);
export const DefaultVideo = Object.assign(
  {},
  { videoId: '', title: '', thumbnail: { url: '' }, displayName: '' }
);

export const SyncStates = [
  { state: 'que', asArray: true },
  { state: 'users', asArray: true },
  { state: 'comments', asArray: true },
  { state: 'playingVideo', asArray: false },
  { state: 'playing', asArray: false },
  { state: 'startTime', asArray: false },
];

export const CommandType = { giphy: '/giphy ' };
export const CommentType = { text: 'text', log: 'log', gif: 'gif' };

export const InitialState = {
  currentUser: DefaultUser,
  searchResult: [],
  comments: [],
  que: [],
  users: [],
  playlists: {},
  playingVideo: DefaultVideo,
  playing: true,
  startTime: 0,
  commentText: '',
  displayName: '',
  mailAddressForSignUp: '',
  passwordForSignUp: '',
  mailAddressForSignIn: '',
  passwordForSignIn: '',
  searchText: '',
  searchedText: '',
  volume: 0.8,
  played: 0,
  loaded: 0,
  duration: 0,
  seeking: false,
  isSearchActive: false,
  isCommentActive: false,
  isQueListActive: false,
};

export const CHANGE_VALUE_WITH_KEY = 'CHANGE_VALUE_WITH_KEY';
export const POST_PLAYING_VIDEO = 'POST_PLAYING_VIDEO';
export const POST_USER = 'POST_USER';
export const REMOVE_USER = 'REMOVE_USER';
export const SET_USER = 'SET_USER';
export const PUSH_VIDEO = 'PUSH_VIDEO';
export const REMOVE_VIDEO = 'REMOVE_VIDEO';
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
export const SET_PLAYLIST = 'SET_PLAYLIST';

export const UPDATE_SYNC_STATE = 'FETCH_SYNC_STATE';
export const UPDATE_QUE = 'UPDATE_QUE';
export const UPDATE_COMMENTS = 'UPDATE_COMMENTS';
export const UPDATE_PLAYED = 'UPDATE_PLAYED';
export const UPDATE_PLAYING = 'UPDATE_PLAYING';
export const UPDATE_PLAYING_VIDEO = 'UPDATE_PLAYING_VIDEO';
export const UPDATE_USERS = 'UPDATE_USERS';
