import { call, takeLatest } from 'redux-saga/effects';
import { post, remove, push } from '../scripts/db';
// import * as Actions from '../actions/app';
import * as Types from '../action_types/app';

const commentObj = (content, user, type, keyword) => (
		Object.assign({ content, user, type, keyword })
);
const DefaultVideo = Object.assign({ id: '', title: '', thumbnail: { url: '' }, displayName: '' });
const CommentType = { text: 'text', log: 'log', gif: 'gif' };

function* postPlayingVideo({ payload }) {
		const { video } = payload;
		if (video) {
				yield call(() => post('playingVideo', video));
				yield call(() => post('startTime', 0));
				yield call(() => remove(`que/${video.key}`));
				const comment = commentObj(`# ${video.title}`, video.user, CommentType.log, '');
				yield call(() => push('comments', comment));
		} else {
				yield call(() => post('playingVideo', DefaultVideo));
				yield call(() => post('startTime', 0));
		}
}

export default function* appSaga() {
		yield takeLatest(Types.ASYNC_POST_PLAYING_VIDEO, postPlayingVideo);
}