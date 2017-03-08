import { fork } from 'redux-saga/effects';
import commentsSaga from './comments'

export default function* rootSaga() {
		yield fork(commentsSaga);
}