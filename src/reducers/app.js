import * as App from '../constants/app';

const app = (state = App.InitialState, action) => {
  const newState = (obj) => Object.assign({}, state, obj);
  switch (action.type) {
    case App.CHANGE_VALUE_WITH_KEY:
      return newState({ [action.key]: action.value });
    case App.CHANGE_TEXT:
      return newState({ [action.textType]: action.text });
    case App.CHANGE_SEARCH_TEXT:
      return newState({ searchText: action.text, isSearchActive: action.isSearchActive });
    case App.SET_PLAYING_VIDEO:
      return newState({
        playing: true,
        startTime: 0,
        playingVideo: action.video,
        que: state.que.filter((item) => item.key !== action.video.key),
      });
    case App.SET_USER:
      return newState({ currentUser: action.user });
    case App.ADD_COMMENT:
      return newState({ comments: [...state.comments, action.comment], commentText: '' });
    case App.SET_DEFAULT_USER:
      return newState({ currentUser: App.DefaultUser });
    case App.FETCH_SYNC_STATE:
      return newState({ [action.key]: action.value });
    case App.ADD_VIDEO:
      return newState({ que: [...state.que, action.video] });
    case App.PUSH_VIDEO:
      return newState({ que: [...state.que, action.video] });
    case App.DELETE_VIDEO:
      return newState({ que: state.que.filter((q) => q.key !== action.video.key) });
    case App.PLAY_PAUSE:
      return newState({ playing: action.playing, startTime: state.played });
    case App.CHANGE_VOLUME:
      return newState({ volume: parseFloat(action.volume) });
    case App.SEEK_DOWN:
      return newState({ seeking: true });
    case App.SEEK_UP:
      return newState({ seeking: false, startTime: action.played });
    case App.CHANGE_PLAYED:
      return newState({ played: action.played, seeking: false });
    case App.PLAY:
      return newState({ playing: action.playing });
    case App.PAUSE:
      return newState({ playing: action.playing, played: action.startTime });
    case App.PROGRESS:
      return !state.seeking ? newState(action.playingStatus) : state;
    case App.PUSH_COMMENT:
      return newState({ comments: [...state.comments, action.comment] });
    case App.SET_SEARCH_RESULT:
      return newState({ searchResult: action.result });
    default:
      return state;
  }
};

export default app;
