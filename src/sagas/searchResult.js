import { call, takeLatest } from 'redux-saga/effects';
import { push, post, remove } from '../scripts/db';
import * as Types from '../action_types/searchResult';

function* pushVideo({ payload }) {
		yield call(() => push('que', payload.video));
}

function* postPlayingVideo({ payload }) {
		yield call(() => post('playingVideo', payload.video));
}

function* removeVideo({ payload }) {
		yield call(() => remove(`que/${payload.videoKey}`));
}

export default function* searchResultSaga() {
		yield takeLatest(Types.ASYNC_PUSH_VIDEO, pushVideo);
		yield takeLatest(Types.ASYNC_POST_PLAYING_VIDEO, postPlayingVideo);
		yield takeLatest(Types.ASYNC_REMOVE_VIDEO, removeVideo);
}