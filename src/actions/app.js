import * as App from '../action_types/app';
import { createAction } from 'redux-actions';
import { post, remove, push } from '../scripts/db';

// sync系
export const asyncPostPlayingVideo = createAction(App.ASYNC_POST_PLAYING_VIDEO,
  (video) => ({ video })
);
export const postUser = (uid, user) => {
  post(`users/${uid}`, user);
  return { type: App.POST_USER };
};
export const removeUser = (uid) => {
  remove(`users/${uid}`);
  return { type: App.REMOVE_USER };
}
export const pushVideo = (video) => {
  push('que', video);
  return { type: App.PUSH_VIDEO };
};
export const removeVideo = (video) => {
  remove(`que/${video.key}`);
  return { type: App.REMOVE_VIDEO };
};
export const changePlayed = (played) => {
  post('startTime', played);
  return { type: App.CHANGE_PLAYED, played };
};
export const play = () => ({ type: App.PLAY });
export const pause = (startTime, duration) => {
  post('startTime', startTime);
  post('currentTime', duration * startTime);
  return { type: App.PAUSE };
};
export const playPause = (isPlaying) => {
  post('playing', !isPlaying);
  return { type: App.PLAY_PAUSE };
};

// local系
export const changeValueWithKey = createAction(App.CHANGE_VALUE_WITH_KEY,
  (key, value) => ({ key, value })
);
export const setUser = createAction(App.SET_USER, (user) => ({user}));
export const setPlaylists = createAction(App.SET_PLAYLISTS, (playlists) => ({playlists}));
export const changeVolume = createAction(App.CHANGE_VOLUME, (volume) => ({ volume }));
export const setSearchResult = createAction(App.SET_SEARCH_RESULT,
  (resultType, result) => ({result, resultType})
);
export const seekDown = createAction(App.SEEK_DOWN);
export const seekUp = createAction(App.SEEK_UP, (played) => ({ played }));
export const progress = createAction(App.PROGRESS, (state) => ({ state }));
export const updateSyncState = createAction(App.UPDATE_SYNC_STATE, (key, value) => ({key, value }));
export const updateComments = createAction(App.UPDATE_COMMENTS, (comments) => ({ comments }));
export const updatePlayed = createAction(App.UPDATE_PLAYED, (played) => ({ played }));
export const updatePlaying = createAction(App.UPDATE_PLAYING, (playing) => ({ playing }));
export const updatePlayingVideo = createAction(App.UPDATE_PLAYING_VIDEO, (video) => ({ video }));
export const updateUsers = createAction(App.UPDATE_USERS, (users) => ({ users }));
export const setPlaylistToResult = createAction(App.UPDATE_SEARCH_RESULT, (results) => ({ results }));
