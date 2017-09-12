import React from 'react';
import { base } from '../../config/firebaseApp.js';
import 'whatwg-fetch';
import classNames from 'classnames';
import ReactPlayer from 'react-player';
import { YOUTUBE_API_KEY } from '../../config/apiKey';
import YouTubeNode from 'youtube-node';
import { post, remove, push } from '../../scripts/db';
import { DefaultVideo, DefaultUser } from '../../constants.js';
import Room from '../../classes/room.js'

// Components
import SearchResult from '../room/searchResult';
import Comments from '../room/comments';
import Wave from '../room/wave';

// Styles
import '../../styles/normalize.scss';
import '../../styles/base.scss';

const youtubeUrl = (id) => `https://www.youtube.com/watch?v=${id}`;

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
		});

		this.room = {};

		// const audio = new Audio();
		// audio.src = '../../../lamb.mp3'
		// audio.play();

    this.onSeekMouseUp = this.onSeekMouseUp.bind(this);
    this.onKeyPressForSearch = this.onKeyPressForSearch.bind(this);
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
		}
		return this.searchPage();
	}

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
				const path = (property) => `rooms/${roomClass.key}/${property}`
        base.listenTo(path('startTime'), { context: this, asArray: false, then(startTime) {
          const played = typeof startTime === 'object' ? 0 : startTime;
          this.setState({ played });
          this.player.seekTo(played);
        }});
        base.listenTo(path('isPlaying'), { context: this, asArray: false, then(playing) {
          this.setState({ isPlaying: typeof playing === 'object' ? true : playing});
        }});
        base.listenTo(path('playingVideo'), { context: this, asArray: false, then(video) {
          const playingVideo = Object.keys(video).length === 0 ? DefaultVideo : video;
          this.setState({ playingVideo });
        }});
        base.listenTo(path('que'), { context: this, asArray: true, then(que) { this.setState({ que }) } });
			}).catch(err => console.log(err));
		return true;
  }

  onKeyPressForSearch(e) {
  	e.preventDefault();
  	this.search(this.state.searchText);
  	return true;
  }

  onSeekMouseUp(e) {
  	const startTime = parseFloat(e.target.value);
  	this.setState({ seeking: false, startTime: startTime });
  	this.player.seekTo(startTime);
  };

  search(searchText) {
  	const youTubeNode = new YouTubeNode();
  	youTubeNode.setKey(YOUTUBE_API_KEY);
  	youTubeNode.addParam('type', 'video');
  	youTubeNode.search(searchText, 50,
			(error, result) => {
  		  if (error) {
				} else {
  		  	const searchResult = result.items.map(item => ({
						id: item.id.videoId,
						title: item.snippet.title,
            thumbnailUrl: item.snippet.thumbnails.default.url,
            type: 'video',
					}));
  		  	this.setState({ searchResult, searchedText: searchText });
  		  }
  	  }
		);
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
		if (this.state.que[0]) post(this.path('playing'), !this.state.isPlaying);
	}

	render() {
		const isPostPlayingVideo = this.state.playingVideo !== '';
		const playingVideo = this.state.playingVideo || DefaultVideo;
		return (
			<div className="contents is-mobile">
				<nav className="mobile-global-nav">
					<div
						className={classNames(
							"mobile-global-nav__item",
							{"is-active":(this.state.pageState===0)}
						)}
						onClick={() => this.setState({ pageState: 0 })}
					>
						<img src="/images/icon_comment.svg" alt=""/>
					</div>
					<div
						className={classNames(
							"mobile-global-nav__item",
							{"is-active":(this.state.pageState===1)}
						)}
						onClick={() => this.setState({ pageState: 1 })}
					>
						<img src="/images/icon_equalizer.svg" alt=""/>
					</div>
					<div
						className={classNames(
							"mobile-global-nav__item",
							{"is-active":(this.state.pageState===2)}
						)}
						onClick={() => this.setState({ pageState: 2 })}
					>
						<img src="/images/icon_search.svg" alt=""/>
					</div>
				</nav>
				{ this.nowPage() }
			</div>
		);
	}

	searchPage() {
		return (
			<div>
				<input
					className={classNames('form-search', { 'is-search-active': this.state.isSearchActive })}
					type="text"
					placeholder="Search"
					onChange={(e) => this.setState({ searchText: e.target.value })}
					onFocus={() => {
						this.setState({ isSearchActive: true, searchResult: [], isPlaylistActive: false });
					}}
					onKeyPress={this.onKeyPressForSearch}
					value={this.state.searchText}
					>
				</input>

				<SearchResult
					que={this.state.que}
					searchResult={this.state.searchResult}
					currentUser={this.state.currentUser}
					searchedText={this.state.searchedText}
					isSearchActive={this.state.isSearchActive}
					isQueListActive={this.state.isQueListActive}
					isNoPlayingVideo={this.state.playingVideo.title === ''}
				/>
			</div>
		)
	}

	playbackPage() {
		const video = this.state.que[0];
		const musicName = this.video ? video.title : '再生していません';
		return (
			<div className="contents">
				只今流れている音楽：{musicName}
				<button
					onClick={() => this.stop()}
				>
					一時停止/再生
				</button>
				<button
					onClick={() => this.goNext()}
				>
					次へ
				</button>
			</div>
		);
	}

	addWave() {

	}

	commentPage() {
		return (
			<div>
				<Wave id='1234' wave='0'/>
				<Comments
					currentUser={this.state.currentUser}
					comments={this.state.comments}
					roomKey={this.state.roomKey}
				/>
			</div>
		);
	}
}

export default Rooms;
