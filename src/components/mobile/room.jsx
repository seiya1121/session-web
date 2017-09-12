import React from 'react';
import { base } from '../../config/firebaseApp.js';
import 'whatwg-fetch';
import classNames from 'classnames';
import ReactPlayer from 'react-player';
import { YOUTUBE_API_KEY } from '../../config/apiKey';
import YouTubeNode from 'youtube-node';
import { post, remove, push } from '../../scripts/db';

// Components
import SearchResult from '../room/searchResult';
import Comments from '../room/comments';

// Styles
import '../../styles/base.scss';
import '../../styles/normalize.scss';

const youtubeUrl = (id) => `https://www.youtube.com/watch?v=${id}`;

const CommentType = { text: 'text', log: 'log', gif: 'gif' };
const commentObj = (content, user, type, keyword) => (
	Object.assign({ content, user, type, keyword })
);
const DefaultVideo = Object.assign({ id: '', title: '', thumbnail: { url: '' }, displayName: '', wave: 0 });
const DefaultUser = Object.assign({ name: '', photoURL: '', accessToken: '', uid: '' });

class Room extends React.Component {
  constructor(props) {
    super(props);
    this.state = ({
      currentUser: DefaultUser,
      playingVideo: DefaultVideo,
      que: [],
      searchResult: [],
      searchText: '',
      searchedText: '',
      isSearchActive: false,
      isQueListActive: false,
      isPlaylistActive: false,
      isPlaying: true,
      seeking: false,
      loaded: 0,
      played: 0,
			pageState: 0,
		});

    this.onSeekMouseUp = this.onSeekMouseUp.bind(this);
    this.onKeyPressForSearch = this.onKeyPressForSearch.bind(this);
    this.goNext = this.goNext.bind(this);
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
  	base.listenTo('startTime', { context: this, asArray: false, then(startTime) {
  		this.setState({ played: startTime });
  	}});
  	base.listenTo('playing', { context: this, asArray: false, then(playing) {
  		this.setState({ isPlaying: playing });
  	}});
  	base.listenTo('playingVideo', { context: this, asArray: false, then(video) {
  		const playingVideo = Object.keys(video).length === 0 ? DefaultVideo : video;
  		this.setState({ playingVideo });
  	}});
  	base.listenTo('que', { context: this, asArray: true, then(que) { this.setState({ que }) } });
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
  		post('playingVideo', video);
  		post('startTime', 0);
  		remove(`que/${video.key}`);
  		push('comments', commentObj(`# ${video.title}`, video.user, CommentType.log, ''));
  	} else {
  		post('playingVideo', DefaultVideo);
  		post('startTime', 0);
  	}
  }

	stop() {
		if (this.state.que[0]) post('playing', !this.state.isPlaying);
	}

	render() {
		const isPostPlayingVideo = this.state.playingVideo !== '';
		const playingVideo = this.state.playingVideo || DefaultVideo;
		return (
			<div className="contents">
				<button
					onClick={() => this.setState({ pageState: 0 })}
				>
					コメントページ
				</button>
				<button
					onClick={() => this.setState({ pageState: 1 })}
				>
					再生ページ
				</button>
				<button
					onClick={() => this.setState({ pageState: 2 })}
				>
					検索
				</button>
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

	commentPage() {
		return (
			<div>
				<button>wave</button>
				<Comments currentUser={this.state.currentUser} />
			</div>
		);
	}
}

export default Room;
