import { fork } from 'redux-saga/effects';
import commentsSaga from './comments'
import searchResultSaga from './searchResult'
import appSaga from './app'

export default function* rootSaga() {
		yield fork(commentsSaga);
		yield fork(searchResultSaga);
		yield fork(appSaga);
}