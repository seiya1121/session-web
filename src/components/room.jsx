import React from 'react';
import { base } from '../config/firebaseApp.js';
import 'whatwg-fetch';
import classNames from 'classnames';
import ReactPlayer from 'react-player';
import { YOUTUBE_API_KEY } from '../config/apiKey';
import YouTubeNode from 'youtube-node';
import { post, remove, push } from '../scripts/db';

// Components
import SearchResult from './room/searchResult';
import Comments from './room/comments';

// Styles
import '../styles/normalize.scss';
import '../styles/base.scss';

const youtubeUrl = (id) => `https://www.youtube.com/watch?v=${id}`;

// const userObj = ({ displayName, photoURL, uid, isAnonymous }, overrideState) => Object.assign(
//   { displayName, photoURL, uid, isAnonymous }, overrideState
// );

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
      duration: 0,
      loaded: 0,
      volume: 0.8,
      played: 0,
      startTime: 0,
		});

    this.onSeekMouseUp = this.onSeekMouseUp.bind(this);
    this.onKeyPressForSearch = this.onKeyPressForSearch.bind(this);
    this.goNext = this.goNext.bind(this);
    this.progress = this.progress.bind(this);
  }

  componentDidMount() {
  	base.listenTo('startTime', { context: this, asArray: false, then(startTime) {
  		this.setState({ played: startTime });
  		this.player.seekTo(startTime);
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
  	if (e.which !== 13) return false;
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
  		  	console.log(error);
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

  progress({ played, loaded }) {
  	const playingStatus = (loaded) ? { played, loaded } : { played };
  	return !this.state.seeking && this.setState(playingStatus);
  }

  render() {
  	const isPostPlayingVideo = this.state.playingVideo !== '';
  	const playingVideo = this.state.playingVideo || DefaultVideo;
		return (
      <div className="contents">
				<header className="header-bar">
					<div className="header-bar__left">
						<div className="header-bar-prof">
						</div>
					</div>
					<div
						className={classNames('button-search-list', { 'is-search-active': this.state.isSearchActive })}
						onClick={() => this.setState({ isSearchActive: !this.state.isSearchActive })}
					>
						<span />
						<span />
						<span />
					</div>
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
					<div
						className={classNames('button-que-list', { 'is-quelist-list': this.state.isQueListActive })}
						onClick={() => this.setState({ isQueListActive: !this.state.isQueListActive})}
					>
						<span />
						<span />
						<span />
					</div>
				</header>
				<div className="main-display">
					<div className="display-youtube">
						<ReactPlayer
							ref={(player) => { this.player = player; }}
							className="react-player"
							width={"100%"}
							height={"100%"}
							url={youtubeUrl(playingVideo.id)}
							playing={this.state.isPlaying}
							volume={this.state.volume}
							youtubeConfig={this.state.youtubeConfig}
							fileConfig={this.state.fileConfig}
							onReady={() => console.log('Ready')}
							onPlay={() => console.log('Play')}
							onPause={() => console.log('Pause')}
							onEnded={this.goNext}
							onError={this.goNext}
							onProgress={this.progress}
							onDuration={(duration) => this.setState({ duration })}
						/>
					</div>
					<Comments currentUser={this.state.currentUser} />
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
				<div className="footer-bar">
					<div className="play-controll">
						<button
							className={classNames(
								{ 'play-controll__pause': this.state.isPlaying },
								{ 'play-controll__play': !this.state.isPlaying },
							)}
							onClick={() => this.setState({ isPlaying: !this.state.isPlaying })}
						>&nbsp;
						</button>
						<button
							className="play-controll__skip"
							onClick={this.goNext}
						>&nbsp;</button>
					</div>
					<div className="progress-box">
						{
							isPostPlayingVideo &&
							<p className="progress-box__ttl">
								{playingVideo.title} {playingVideo.displayName}
							</p>
						}
						<div className="progress-bar">
							<input
								className="progress-bar__seek"
								type="range" min={0} max={1} step="any"
								value={this.state.played}
								onMouseDown={() => this.setState({ seeking: false })}
								onChange={(e) => this.setState({ played: parseFloat(e.target.value), seeking: false })}
								onMouseUp={this.onSeekMouseUp}
							/>
							<div className="progress-bar__played" style={{ width: `${100 * this.state.played}%` }}>
							</div>
							<div className="progress-bar__loaded" style={{ width: `${100 * this.state.loaded}%` }}>
							</div>
						</div>
						<div className="progress-box__status">
							<p>{this.state.duration * this.state.played}</p>
						</div>
					</div>

					<div className="volume-box">
						<p className="volume-box__ttl">Volume</p>
						<div className="volume-box__range-wrap">
							<input
								className="volume-box__range"
								type="range"
								min={0}
								max={1}
								step="any"
								value={this.state.volume}
								onChange={(e) => this.setState({ volume: e.target.value}) }
							/>
						</div>
						<p className="volume-box__ttl" onClick={() => this.setState({ volume: 0 })}>mute</p>
					</div>
				</div>
      </div>
    );
  }
}

export default Room;
