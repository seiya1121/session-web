import { fork } from 'redux-saga/effects';
import commentsSaga from './comments'
import searchResultSaga from './searchResult'

export default function* rootSaga() {
		yield fork(commentsSaga);
		yield fork(searchResultSaga);
}