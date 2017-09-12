import React from 'react';
import { base, firebaseAuth } from '../config/firebaseApp.js';
import 'whatwg-fetch';
import classNames from 'classnames';
import ReactPlayer from 'react-player';
import { YOUTUBE_API_KEY } from '../config/apiKey';
import YouTubeNode from 'youtube-node';
import { post, remove, push } from '../scripts/db';
import { DefaultVideo, DefaultUser } from '../constants.js';
import Room from '../classes/room.js'

// Components
import SearchResult from './room/searchResult';
import Comments from './room/comments';

// Styles
import '../styles/base.scss';
import '../styles/normalize.scss';

const youtubeUrl = (id) => `https://www.youtube.com/watch?v=${id}`;

const parseUser = ({ displayName, photoURL, uid, isAnonymous }, overrideState) => Object.assign(
  { displayName, photoURL, uid, isAnonymous }, overrideState
);

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
      duration: 0,
      loaded: 0,
      volume: 0.8,
      played: 0,
      startTime: 0,
		});

    this.room = {};

    this.onSeekMouseUp = this.onSeekMouseUp.bind(this);
    this.onKeyPressForSearch = this.onKeyPressForSearch.bind(this);
    this.goNext = this.goNext.bind(this);
    this.progress = this.progress.bind(this);
    this.onClickTogglePlay = this.onClickTogglePlay.bind(this);
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
        this.signIn();
        firebaseAuth.onAuthStateChanged(u => {
          if(u) {
            push(path('users'), parseUser(u))
          }else{
            console.log('sign out');
          }
        });
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
        base.listenTo(path('comments'), { context: this, asArray: true, then(comments) { this.setState({ comments }) } });
			}).catch(err => console.log(err));
		return true;
	}

	signIn() {
    firebaseAuth.signInAnonymously().catch(function(error) {
      console.log(error);
    });
  }

  checkSignUser(){
    firebaseAuth.onAuthStateChanged(user=> {
      if(user) {
        push(`rooms/`)
      }else{

      }
      console.log(user);
    })
  }

  roomPath() {
  	return `rooms/${this.state.roomKey}`;
	}

	path(path) {
  	return `${this.roomPath()}/${path}`;
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

  onClickTogglePlay() {
    post(this.path('isPlaying'), !this.state.isPlaying)
  }

	goNext() {
  	const video = this.state.que[0];
  	console.log(this.roomPath());
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

  progress({ played, loaded }) {
  	const playingStatus = (loaded) ? { played, loaded } : { played };
  	return !this.state.seeking && this.setState(playingStatus);
  }

  render() {
  	const isPostPlayingVideo = this.state.playingVideo !== '';
  	const playingVideo = this.state.playingVideo || DefaultVideo;
		return (
      <div className="contents">

				{/*Header*/}
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
          {/*Player*/}
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
							onReady={() => console.log('Ready')}
							onPlay={() => console.log('Play')}
							onPause={() => console.log('Pause')}
							onEnded={this.goNext}
							onError={this.goNext}
							onProgress={this.progress}
							onDuration={(duration) => this.setState({ duration })}
						/>
					</div>

					{/*Comment*/}
					<Comments
						currentUser={this.state.currentUser}
            comments={this.state.comments}
						roomKey={this.state.roomKey}
					/>

          {/*SearchResult*/}
					<SearchResult
						roomId={this.state.roomKey}
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

					{/*Controll*/}
					<div className="play-controll">
						<button
              className={classNames(
              	{ 'play-controll__pause': this.state.isPlaying },
                { 'play-controll__play': !this.state.isPlaying },
              )}
              onClick={this.onClickTogglePlay}
            >&nbsp;
						</button>
						<button
							className="play-controll__skip"
							onClick={this.goNext}
						>&nbsp;</button>
					</div>

					{/*ProgressBar*/}
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

export default Rooms;
