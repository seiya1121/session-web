import * as App from '../constants/app';

export const changeText = (textType, text) => ({ type: App.CHANGE_TEXT, textType, text });
export const setPlayingVideo = (video) => ({ type: App.SET_PLAYING_VIDEO, video });
export const setUser = (user, isLogin) => ({ type: App.SET_USER, user, isLogin });
export const setDefaultUser = () => ({ type: App.SET_DEFAULT_USER });
export const setQue = (video) => ({ type: App.SET_QUE, video });
export const deleteQue = (video) => ({ type: App.DELETE_QUE, video });
export const playPause = () => ({ type: App.PLAY_PAUSE });
export const setVolume = (volume) => ({ type: App.SET_VOLUME, volume });
export const seekDown = () => ({ type: App.SEEK_DOWN });
export const seekUp = (played) => ({ type: App.SEEK_UP, played });
export const changePlayed = (played) => ({ type: App.CHANGE_PLAYED, played });
export const play = () => ({ type: App.PLAY });
export const paunse = () => ({ type: App.PLAY });
export const progress = (played, loaded) => ({ type: App.PROGRESS });
export const setComment = (comment) => ({ type: App.SET_COMMENT, comment });
export const setSearchResult = (result) => ({
    type: App.SET_SEARCH_RESULT,
    result: result.items.map((item) => ({
      videoId: item.id.videoId, title: item.snippet.title, thumbnail: item.snippet.thumbnails.default
    })),
})
