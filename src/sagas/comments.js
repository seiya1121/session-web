import { call, takeLatest } from 'redux-saga/effects';
import { push } from '../scripts/db';
import * as Types from '../action_types/comments';

function* asyncAddComment({ payload }) {
		yield call(() => push('comments', payload.comment));
}


export default function* commentsSaga() {
		yield takeLatest(Types.ASYNC_ADD_COMMENT, asyncAddComment);
}