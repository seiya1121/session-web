import * as Types from '../action_types/comments';
import { createAction } from 'redux-actions';

// sync系
export const asyncAddComment = createAction(Types.ASYNC_ADD_COMMENT, (comment) => ({ comment }));

// local系
export const changeCommentText = createAction(Types.CHANGE_COMMENT_TEXT, (comment) => ({ comment }));
export const updateComments = createAction(Types.UPDATE_COMMENTS, (comments) => ({ comments }));
export const changeIsCommentActive = createAction(Types.CHANGE_IS_COMMENT_ACTIVE, (value) => ({ value }));
