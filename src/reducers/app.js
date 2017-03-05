import * as App from '../constants/app';

const resultObj = (item, resultType) => {
  switch (resultType) {
    case 'search':
      return {
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnailUrl: item.snippet.thumbnails.default.url,
        type: 'video',
      };
    case 'playlistVideo':
      const { resourceId, title, thumbnails } = item.snippet;
      return { id: resourceId.videoId, title, thumbnailUrl: thumbnails.default.url, type: 'video' };
    case 'playlist':
      const { id, thumbnailUrl } = item;
      return { id, title: item.title, thumbnailUrl, type: 'list', };
    default:
      return {};
  }
}

const app = (state = App.InitialState, action) => {
  const newState = (obj) => Object.assign({}, state, obj);
  const { payload } = action;
  switch (action.type) {
    case App.CHANGE_VALUE_WITH_KEY:
      return newState({ [payload.key]: payload.value });
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
      return newState({ currentUser: payload.user });
    case App.SET_PLAYLISTS:
      return newState({ playlists: payload.playlists });
    case App.ADD_COMMENT:
      return newState({ commentText: '', isCommentActive: false });
    case App.CHANGE_VOLUME:
      return newState({ volume: parseFloat(payload.volume) });
    case App.SEEK_DOWN:
      return newState({ seeking: true });
    case App.SEEK_UP:
      return newState({ seeking: false, startTime: payload.played });
    case App.CHANGE_PLAYED:
      return newState({ played: payload.played, seeking: false });
    case App.PROGRESS:
      const { played, loaded } = payload.state;
      const playingStatus = (loaded) ? { played, loaded } : { played };
      return !state.seeking ? newState(playingStatus) : state;
    case App.SET_SEARCH_RESULT:
      const { result, resultType } = payload;
      const tempResult = (resultType === 'playlistVideo') ?
        result.items.filter((item) => item.snippet.title !== "Deleted video") : result;
      return newState({ searchResult: tempResult.map((item) =>  resultObj(item, resultType)) });
    case App.UPDATE_SYNC_STATE:
      return newState({ [payload.key]: payload.value });
    case App.UPDATE_QUE:
      return newState({ que: payload.que });
    case App.UPDATE_COMMENTS:
      return newState({ comments: payload.comments });
    case App.UPDATE_PLAYED:
      return newState({ played: payload.played });
    case App.UPDATE_PLAYING:
      return newState({ playing: payload.playing });
    case App.UPDATE_PLAYING_VIDEO:
    const playingVideo = Object.keys(payload.video).length === 0 ? App.DefaultVideo : payload.video;
      return newState({
        playing: true,
        startTime: 0,
        playingVideo,
        que: state.que.filter((item) => item.key !== playingVideo.key),
      });
    case App.UPDATE_USERS:
      return newState({ users: payload.users });
    case App.UPDATE_SEARCH_RESULT:
      return newState({ searchResult: app.lists, isSearchActive: true });
    default:
      return state;
  }
};

export default app;
