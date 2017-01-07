import * as App from '../constants/app';

export const changeText = (textType, text) => ({ type: App.CHANGE_TEXT, textType, text });
export const setPlayingVideo = (video) => ({ type: App.SET_PLAYING_VIDEO, video });
export const setUser = (name, photoURL, isLogin) => ({
  type: App.SET_USER, name, photoURL, isLogin
});
export const setQue = (video) => ({ type: App.SET_QUE, video });
export const deleteQue = (video) => ({ type: App.DELETE_QUE, video });
export const playPause = () => ({ type: App.PLAY_PAUSE });
export const setVolume = (volume) => ({ type: App.SET_VOLUME, volume });
export const seekDown = () => ({ type: App.SEEK_DOWN });
export const seekUp = (played) => ({ type: App.SEEK_UP, played });
export const changePlayed = (played) => ({ type: App.CHANGE_PLAYED, played });
export const playingOn = () => ({ type: App.PLAYING_ON });
