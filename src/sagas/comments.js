import { call, put, takeLatest } from 'redux-saga/effects';
import { push } from '../scripts/db';
import * as Actions from '../actions/comments';
import * as Types from '../action_types/comments';

function* pushComment({ payload }) {
		yield call(() => push('comments', payload.comment));
		yield put(Actions.initCommentText);
}


export default function* commentsSaga() {
		yield takeLatest(Types.ASYNC_PUSH_COMMENT, pushComment);
}