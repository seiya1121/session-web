import { DefaultVideo } from '../constants.js';
import { firebaseDB } from '../config/firebaseApp.js';

export default class Room {
	constructor(
		key, name, comments = [], isPlaying = true, playingVideo = DefaultVideo, users = [],
    que = [], startTime = ''
	) {
		this.key = key;
		this.name = name;
		this.comments = comments;
		this.isPlaying = isPlaying;
		this.startTime = startTime;
		this.playingVideo = playingVideo;
		this.users = users;
		this.que = que;
	}

	listenTo(property, func) {
    firebaseDB.ref(`rooms/${this.key}/${property}`).on('value', (res) => func(res.val()))
  }
}
