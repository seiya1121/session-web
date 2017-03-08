import * as Types from '../action_types/searchResult';

const InitialState ={
		que: [],
		playlists: [],
		selectedPlaylist: '',
};

const searchResult = (state = InitialState, action) => {
		const newState = (obj) => Object.assign({}, state, obj);
		const { payload } = action;
		switch (action.type) {
				case Types.POST_PLAYING_VIDEO:
						return state;
				case Types.REMOVE_VIDEO:
						return state;
				case Types.SET_PLAYLISTS:
						return newState({ playlists: payload.playlists });
				case Types.UPDATE_QUE:
						return newState({ que: payload.que });
				case Types.UPDATE_SEARCH_RESULT:
						return newState({ searchResult: payload.lists, isSearchActive: true });
				default:
						return state;
		}
};

export default searchResult;