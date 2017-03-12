import { call, put, takeLatest } from 'redux-saga/effects';
import { post, remove, push } from '../scripts/db';
import * as Types from '../action_types/searchResult';
import * as Actions from '../actions/searchResult';

const commentObj = (content, user, type, keyword) => (
		Object.assign({ content, user, type, keyword })
);

const CommentType = { text: 'text', log: 'log', gif: 'gif' };

function* postQue({ payload }) {
		yield call(() => post('que', payload.que));
		yield put(Actions.updateQue(payload.que))
}

function* pushVideo({ payload }) {
		yield call(push, 'que', payload.video);
}

function* postPlayingVideo({ payload }) {
		const { video } = payload;
		yield call(() => post('playingVideo', video));
		yield call(() => post('playingVideo', video));
		yield call(() => post('startTime', 0));
		yield call(() => remove(`que/${video.key}`));
		const comment = commentObj(`# ${video.title}`, video.user, CommentType.log, '');
		yield call(() => push('comments', comment));
}

function* removeVideo({ payload }) {
		yield call(() => remove(`que/${payload.videoKey}`));
}

export default function* searchResultSaga() {
		yield takeLatest(Types.ASYNC_PUSH_VIDEO, pushVideo);
		yield takeLatest(Types.ASYNC_POST_PLAYING_VIDEO_FROM_QUE, postPlayingVideo);
		yield takeLatest(Types.ASYNC_REMOVE_VIDEO, removeVideo);
		yield takeLatest(Types.ASYNC_UPDATE_QUE, postQue);
}