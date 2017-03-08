import * as Types from '../action_types/searchResult';
import { createAction } from 'redux-actions';

// sync系
export const asyncPushVideo = createAction(Types.ASYNC_PUSH_VIDEO, (video) => ({ video }));
export const asyncRemoveVideo = createAction(Types.ASYNC_REMOVE_VIDEO, (videoKey) => ({ videoKey }));
export const asyncPostPlayingVideo = createAction(Types.ASYNC_POST_PLAYING_VIDEO, (video) => ({ video }));

// local系
export const setSearchResult = createAction(Types.SET_SEARCH_RESULT,
		(resultType, result) => ({result, resultType})
);
export const updateQue = createAction(Types.UPDATE_QUE, (que) => ({ que }));
