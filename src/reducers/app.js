import * as App from '../constants/app';

const app = (state = App.InitialState, action) => {
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
      return newState({ currentUser: App.DefaultUser})
    case App.FETCH_SYNC_STATE:
      return newState({ [action.key]: action.value })
    case App.ADD_VIDEO:
      return newState({ que: [...state.que, action.video] })
    case App.DELETE_QUE:
      return newState({ que: state.que.filter((q) => q.key !== action.video.key) })
    case App.PLAY_PAUSE:
      return newState({ playing: !state.playing, startTime: state.played })
    case App.CHANGE_VOLUME:
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
