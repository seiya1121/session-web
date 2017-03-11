export const YoutubeApiUrl = 'https://www.googleapis.com/youtube/v3';

export const DefaultVideo = Object.assign({ id: '', title: '', thumbnail: { url: '' }, displayName: '' });

export const commentObj = (content, user, type, keyword) => (
  Object.assign({}, { content, user, type, keyword })
);

export const CommandType = { giphy: '/giphy ' };
export const CommentType = { text: 'text', log: 'log', gif: 'gif' };

export const CHANGE_VALUE_WITH_KEY = 'CHANGE_VALUE_WITH_KEY';
export const ASYNC_POST_PLAYING_VIDEO = 'ASYNC_POST_PLAYING_VIDEO';
export const POST_USER = 'POST_USER';
export const REMOVE_USER = 'REMOVE_USER';
export const SET_USER = 'SET_USER';
export const PUSH_VIDEO = 'PUSH_VIDEO';
export const REMOVE_VIDEO = 'REMOVE_VIDEO';
export const PLAY_PAUSE = 'PLAY_PAUSE';
export const CHANGE_VOLUME = 'CHANGE_VOLUME';
export const SEEK_DOWN = 'SEEK_DOWN';
export const SEEK_UP = 'SEEK_UP';
export const CHANGE_PLAYED = 'CHANGE_PLAYED';
export const PLAY = 'PLAY';
export const PAUSE = 'PAUSE';
export const PROGRESS = 'PROGRESS';
export const SET_SEARCH_RESULT = 'SET_SEARCH_RESULT';
export const SET_PLAYLISTS = 'SET_PLAYLISTS';
export const UPDATE_SYNC_STATE = 'FETCH_SYNC_STATE';
export const UPDATE_QUE = 'UPDATE_QUE';
export const UPDATE_PLAYED = 'UPDATE_PLAYED';
export const UPDATE_PLAYING = 'UPDATE_PLAYING';
export const UPDATE_PLAYING_VIDEO = 'UPDATE_PLAYING_VIDEO';
export const UPDATE_USERS = 'UPDATE_USERS';
