import * as Types from '../action_types/comments';

const InitialState = {
		commentText: '',
		isCommentActive: false,
		comments: [],
};

const comments = (state = InitialState, action) => {
		const newState = (obj) => Object.assign({}, state, obj);
		const { payload } = action;
		switch (action.type) {
				case Types.CHANGE_COMMENT_TEXT:
						return newState({ commentText: payload.comment });
				case Types.CHANGE_IS_COMMENT_ACTIVE:
						return newState({ isCommentActive: payload.value });
				case Types.UPDATE_COMMENTS:
						return newState({ comments: payload.comments });
				case Types.INIT_COMMENT_TEXT:
						return newState({ commentText: '' });
				default:
						return state;
		}
};

export default comments;
