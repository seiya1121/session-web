import * as App from '../constants/app';
import { base } from '../config/firebaseApp.js';

const push = (stateName, data) => base.push(stateName, { data });
const post = (stateName, data) => base.post(stateName, { data });
const remove = (endPoint) => base.remove(endPoint);

// sync系
export const setPlayingVideo = (video) => {
  post('playingVideo', video);
  return { type: App.SET_PLAYING_VIDEO, video };
};
export const fetchSyncState = (key, value) => ({ type: App.FETCH_SYNC_STATE, key, value });
export const addVideo = (video) => {
  push('que', video);
  return { type: App.ADD_VIDEO, video };
};
export const addComment = (comment) => {
  push('comments', comment);
  return { type: App.ADD_COMMENT, comment };
};
export const deleteVideo = (video, index) => {
  remove(`que/${index}`);
  return { type: App.DELETE_VIDEO, video };
};
export const changePlayed = (played) => {
  post('startTime', played);
  return { type: App.CHANGE_PLAYED, played };
};
export const play = () => {
  const playing = true;
  post('playing', playing);
  return { type: App.PLAY, playing };
};
export const pause = (startTime) => {
  const playing = false;
  post('playing', playing);
  post('startTime', startTime);
  return { type: App.PAUSE, playing, startTime };
};
export const playPause = (isPlaying) => {
  const playing = !isPlaying;
  post('playing', playing);
  return { type: App.PLAY_PAUSE, playing };
};

// local系
export const changeValueWithKey = (key, value) => ({
  type: App.CHANGE_VALUE_WITH_KEY, key, value,
});
export const changeText = (textType, text) => ({ type: App.CHANGE_TEXT, textType, text });
export const changeSearchText = (text) => ({
  type: App.CHANGE_SEARCH_TEXT, text, isSearchActive: text.length >= 1,
});
export const setUser = (user, isLogin) => ({ type: App.SET_USER, user, isLogin });
export const setDefaultUser = () => ({ type: App.SET_DEFAULT_USER });
export const changeVolume = (volume) => ({ type: App.CHANGE_VOLUME, volume });
export const setSearchResult = (result) => ({
  type: App.SET_SEARCH_RESULT,
  result: result.items.map((item) => ({
    videoId: item.id.videoId, title: item.snippet.title, thumbnail: item.snippet.thumbnails.default,
  })),
});
export const seekDown = () => ({ type: App.SEEK_DOWN });
export const seekUp = (played) => ({ type: App.SEEK_UP, played });
export const progress = (state) => {
  const { played, loaded } = state;
  const playingStatus = (state.loaded) ? { played, loaded } : { played };
  return { type: App.PROGRESS, playingStatus };
};
