import { call, takeLatest } from 'redux-saga/effects';
import { push } from '../scripts/db';
import * as Types from '../action_types/comments';

function* pushComment({ payload }) {
		yield call(() => push('comments', payload.comment));
}


export default function* commentsSaga() {
		yield takeLatest(Types.ASYNC_PUSH_COMMENT, pushComment);
}