import * as App from '../constants/app';
import { base } from '../config/firebaseApp.js';

const push = (stateName, data) => base.push(stateName, { data });

// sync系
export const setPlayingVideo = (video) => ({ type: App.SET_PLAYING_VIDEO, video });
export const fetchSyncState = (key, value) => ({ type: App.FETCH_SYNC_STATE, key, value });
export const addVideo = (video) => {
  push('que', video);
  return { type: App.ADD_VIDEO, video };
};
export const addComment = (comment) => {
  push('comments', comment);
  return { type: App.ADD_COMMENT, comment };
};
export const deleteVideo = (video) => ({ type: App.DELETE_VIDEO, video });
export const changePlayed = (played) => ({ type: App.CHANGE_PLAYED, played });
export const play = () => ({ type: App.PLAY });
export const pause = () => ({ type: App.PAUSE });
export const progress = (state) => {
  const { played, loaded } = state;
  const playingStatus = (state.loaded) ? { played, loaded } : { played }
  return { type: App.PROGRESS, playingStatus };
}
export const seekDown = () => ({ type: App.SEEK_DOWN });
export const seekUp = (played) => ({ type: App.SEEK_UP, played });
export const playPause = () => ({ type: App.PLAY_PAUSE });

// local系
export const changeText = (textType, text) => ({ type: App.CHANGE_TEXT, textType, text });
export const setUser = (user, isLogin) => ({ type: App.SET_USER, user, isLogin });
export const setDefaultUser = () => ({ type: App.SET_DEFAULT_USER });
export const changeVolume = (volume) => ({ type: App.CHANGE_VOLUME, volume });
export const setSearchResult = (result) => ({
    type: App.SET_SEARCH_RESULT,
    result: result.items.map((item) => ({
      videoId: item.id.videoId, title: item.snippet.title, thumbnail: item.snippet.thumbnails.default
    })),
});
