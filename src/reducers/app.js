import * as App from '../constants/app';

const app = (state = App.InitialState, action) => {
  const newState = (obj) => Object.assign({}, state, obj);
  switch (action.type) {
    case App.CHANGE_VALUE_WITH_KEY:
      return newState({ [action.key]: action.value });
    case App.POST_PLAYING_VIDE:
      return state;
    case App.REMOVE_VIDEO:
      return state;
    case App.PLAY:
      return state;
    case App.PAUSE:
      return state;
    case App.PLAY_PAUSE:
      return state;
    case App.POST_USER:
      return state;
    case App.REMOVE_USER:
      return state;
    case App.SET_USER:
      return newState({ currentUser: action.user });
    case App.SET_PLAYLISTS:
      return newState({ playlists: action.playlists });
    case App.ADD_COMMENT:
      return newState({ commentText: '', isCommentActive: false });
    case App.SET_DEFAULT_USER:
      return newState({ currentUser: App.DefaultUser });
    case App.CHANGE_VOLUME:
      return newState({ volume: parseFloat(action.volume) });
    case App.SEEK_DOWN:
      return newState({ seeking: true });
    case App.SEEK_UP:
      return newState({ seeking: false, startTime: action.played });
    case App.CHANGE_PLAYED:
      return newState({ played: action.played, seeking: false });
    case App.PROGRESS:
      return !state.seeking ? newState(action.playingStatus) : state;
    case App.SET_SEARCH_RESULT:
      return newState({ searchResult: action.result });
    case App.UPDATE_SYNC_STATE:
      return newState({ [action.key]: action.value });
    case App.UPDATE_QUE:
      return newState({ que: action.que });
    case App.UPDATE_COMMENTS:
      return newState({ comments: action.comments });
    case App.UPDATE_PLAYED:
      return newState({ played: action.played });
    case App.UPDATE_PLAYING:
      return newState({ playing: action.playing });
    case App.UPDATE_PLAYING_VIDEO:
      return newState({
        playing: true,
        startTime: 0,
        playingVideo: action.playingVideo,
        que: state.que.filter((item) => item.key !== action.playingVideo.key),
      });
    case App.UPDATE_USERS:
      return newState({
        users: action.users.map((user) => {
          const temp = Object.keys(user).map((k) => user[k]);
          return Object.assign({}, {name: temp[0].name, photoURL: temp[0].photoURL})
        })
      });
    case App.UPDATE_SEARCH_RESULT:
      return newState({ searchResult: app.lists, isSearchActive: true });
    default:
      return state;
  }
};

export default app;
