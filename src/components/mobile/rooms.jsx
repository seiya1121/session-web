import React from 'react';
import { base } from '../../config/firebaseApp.js';
import 'whatwg-fetch';
import classNames from 'classnames';
// import ReactPlayer from 'react-player';
import { post, remove, push } from '../../scripts/db';
import { DefaultVideo, DefaultUser } from '../../constants.js';
import Room from '../../classes/room.js'

// Components
import SearchResult from './room/searchResult';
import Comments from '../room/comments';
import Wave from '../room/wave';

// Styles
import '../../styles/normalize.scss';
import '../../styles/base.scss';

const CommentType = { text: 'text', log: 'log', gif: 'gif' };
const commentObj = (content, user, type, keyword) => (
	Object.assign({ content, user, type, keyword })
);

class Rooms extends React.Component {
  constructor(props) {
    super(props);
    this.state = ({
			roomKey: '',
			roomName: '',
      currentUser: DefaultUser,
      playingVideo: DefaultVideo,
      que: [],
      searchResult: [],
      comments: [],
      searchText: '',
      searchedText: '',
      isSearchActive: false,
      isQueListActive: false,
      isPlaylistActive: false,
      isPlaying: true,
      seeking: false,
      loaded: 0,
      played: 0,
      startTime: 0,
			pageState: 0,
			videoWaves: [],
		});

		this.room = {};
    this.onSeekMouseUp = this.onSeekMouseUp.bind(this);
    this.goTargetVideo = this.goTargetVideo.bind(this);
    this.goNext = this.goNext.bind(this);
  }

	roomPath() {
		return `rooms/${this.state.roomKey}`;
	}

	path(path) {
		return `${this.roomPath()}/${path}`;
	}

	isCommentPage() {
		return this.state.pageState === 0
	}

	isPlaybackPage() {
		return this.state.pageState === 1
	}

	isSearchPage() {
		return this.state.pageState === 2
	}

	nowPage() {
		if (this.isCommentPage()) {
			return this.commentPage();
		} else if (this.isPlaybackPage()) {
			return this.playbackPage();
		} else if (this.state.pageState === 3) {
			console.log('que');
			return this.quePage();
		}
		return this.searchPage();
	}

	// callWave(num) {
	// 	const audio = new Audio();
	// 	if (num > 0) {
	// 		for (let i = 0; i < num; i++) {
	// 			audio.src = '../../../lamb.mp3';
	// 			audio.play();
	// 		}
	// 	}
	// }

  componentDidMount() {
		const { match } = this.props;
  	const { roomName } = match.params;
  	base.fetch('rooms', { context: this, asArray: true})
			.then(data => {
				const room = data.find(r => r.name === roomName);
				if(room == null) {
					this.props.history.push({ pathname: '/' });
					return false;
				}
        const roomClass = new Room(room.key, room.name);
				this.setState({ roomKey: room.key, roomName: room.name });
				const path = (property) => `rooms/${roomClass.key}/${property}`;
        base.listenTo(path('isPlaying'), { context: this, asArray: false, then(isPlaying) {
          this.setState({ isPlaying: typeof playing === 'object' ? true : isPlaying});
        }});
        base.listenTo(path('playingVideo'), { context: this, asArray: false, then(video) {
          const playingVideo = Object.keys(video).length === 0 ? DefaultVideo : video;
          this.setState({ playingVideo });
        }});
        base.listenTo(path('que'), { context: this, asArray: true, then(que) { this.setState({ que }) } });
				base.listenTo(path('comments'), { context: this, asArray: true, then(comments) {
					this.setState({ comments });
				}});
				// base.listenTo(path('videoWaves'), { context: this, asArray: true, then(videoWaves) {
				// 	const localNum = this.state.videoWaves.filter((vw) => vw.videoId === this.state.playingVideo.id ).length;
				// 	const allNum = videoWaves.filter((vw) => vw.videoId === this.state.playingVideo.id ).length;
				// 	if (allNum - localNum !== 0 ) this.callWave(allNum-localNum);
				// 	this.setState({ videoWaves });
				// }});
			}).catch(err => console.log(err));
		return true;
  }

  onSeekMouseUp(e) {
  	const startTime = parseFloat(e.target.value);
  	this.setState({ seeking: false, startTime: startTime });
  	this.player.seekTo(startTime);
  };

  goTargetVideo(video) {
    post(this.path('playingVideo'), video);
    post(this.path('startTime'), 0);
    remove(this.path(`que/${video.key}`));
    push(this.path('comments'), commentObj(`# ${video.title}`, video.user, CommentType.log, ''));
  }

	goNext() {
		const video = this.state.que[0];
  	if (video) {
  		post(this.path('playingVideo'), video);
  		post(this.path('startTime'), 0);
  		remove(this.path(`que/${video.key}`));
  		push(this.path('comments'), commentObj(`# ${video.title}`, video.user, CommentType.log, ''));
  	} else {
  		post(this.path('playingVideo'), DefaultVideo);
  		post(this.path('startTime'), 0);
  	}
  }

	stop() {
		if (this.state.que[0]) post(this.path('isPlaying'), !this.state.isPlaying);
	}

	queNode() {
		return this.state.que.map((video, i) => (
			<li key={video.key} className="list-group-item">
				<div
					className="list-group-item__click"
					onClick={() => this.goTargetVideo(video)}
				>
					<img
						className="list-group-item__thumbnail"
						src={video.thumbnailUrl}
						alt=""
					/>
					<div className="list-group-item__body">
						<strong>{video.title}</strong>
						<p className="list-group-item__name">added by {video.user.displayName}</p>
					</div>
				</div>
				<div className="list-group-item__close" onClick={() => remove(this.path(`que/${video.key}`))}>
				</div>
			</li>
    ))
	}

	quePage() {
		return (
			<div className="display-control">
				<div className="display-list">
					<div className="list-group-title">
						Up Coming <span className="list-group-title__number">{this.state.que.length}</span>
					</div>
					<ul className="list-group">
            {this.queNode()}
					</ul>
				</div>
			</div>
		)
	}

  searchPage() {
    return (
			<SearchResult
				roomId={this.state.roomKey}
				que={this.state.que}
				currentUser={this.state.currentUser}
				isNoPlayingVideo={this.state.playingVideo.title === ''}
			/>
    )
  }

  playbackPage() {
    const { playingVideo } = this.state;
    const musicName = playingVideo ? playingVideo.title : '再生していません';
    return (
			<div className="mobile-control">
				<div className="mobile-style-title">{musicName}</div>
				<nav className="mobile-control-buttons">
					<div className="play-controll">
						<button
							className="play-controll__pause"
							onClick={() => this.stop()}
						>
							&nbsp;
						</button>
						<button
							className="play-controll__skip"
							onClick={() => this.goNext()}
						>
							&nbsp;
						</button>
					</div>
				</nav>
			</div>
    );
  }

  commentPage() {
    return (
			<div>
				<div className="mobile-wave-locator">
					<Wave
						playingVideo={this.state.playingVideo}
						roomKey={this.state.roomKey}
					/>
				</div>
				<Comments
					currentUser={this.state.currentUser}
					comments={this.state.comments}
					roomKey={this.state.roomKey}
				/>
			</div>
    );
  }

	render() {
		return (
			<div className="contents is-mobile">
				<nav className="mobile-global-nav">
					<div
						className={classNames(
							"mobile-global-nav__item",
							{"is-active": this.state.pageState === 0 }
						)}
						onClick={() => this.setState({ pageState: 0 })}
					>
						<img src="/images/icon_comment.svg" alt=""/>
					</div>
					<div
						className={classNames(
							"mobile-global-nav__item",
							{"is-active": this.state.pageState === 1 }
						)}
						onClick={() => this.setState({ pageState: 1 })}
					>
						<img src="/images/icon_equalizer.svg" alt=""/>
					</div>
					<div
						className={classNames(
              "mobile-global-nav__item",
              {"is-active": this.state.pageState === 3 }
            )}
						onClick={() => this.setState({ pageState: 3 })}
					>
						<img src="/images/icon_list.svg" alt=""/>
					</div>
					<div
						className={classNames(
							"mobile-global-nav__item",
							{"is-active": this.state.pageState===2 }
						)}
						onClick={() => this.setState({ pageState: 2 })}
					>
						<img src="/images/icon_search.svg" alt=""/>
					</div>

				</nav>
				{this.nowPage()}
			</div>
		);
	}
}

export default Rooms;
