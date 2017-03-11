import * as App from '../action_types/app';

export const DefaultUser = Object.assign({ name: '', photoURL: '', accessToken: '', uid: '' });
export const DefaultVideo = Object.assign({ id: '', title: '', thumbnail: { url: '' }, displayName: '' });

const InitialState = {
		currentUser: DefaultUser,
		users: [],
		searchResult: [],
		playingVideo: DefaultVideo,
		playing: true,
		startTime: 0,
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
		isQueListActive: false,
		isPlaylistActive: false,
};

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
};

const app = (state = InitialState, action) => {
  const newState = (obj) => Object.assign({}, state, obj);
  const { payload } = action;
  switch (action.type) {
    case App.CHANGE_VALUE_WITH_KEY:
      return newState({ [payload.key]: payload.value });
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
    case App.SET_USER:
      return newState({ currentUser: payload.user });
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
    case App.UPDATE_PLAYED:
      return newState({ played: payload.played });
    case App.UPDATE_PLAYING:
      return newState({ playing: payload.playing });
    case App.UPDATE_PLAYING_VIDEO:
      const playingVideo = Object.keys(payload.video).length === 0 ? App.DefaultVideo : payload.video;
      return newState({ playingVideo });
    case App.UPDATE_USERS:
      return newState({ users: payload.users });
    default:
      return state;
  }
};

export default app;
