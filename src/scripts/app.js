import React from 'react';
import ReactBaseComponent from './reactBaseComponent';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as AppActions from './actions/app';
import { YOUTUBE_API_KEY } from './api_key.js';
import { base, firebaseAuth } from './firebaseApp.js';
import YouTubeNode from 'youtube-node';
import ReactPlayer from 'react-player';
import { getAnimalName } from './animal.js';
import giphy from 'giphy-api';

const SyncStates = [
  { state: 'que', asArray: true },
  { state: 'users', asArray: true },
  { state: 'comments', asArray: true },
  { state: 'playingVideo', asArray: false },
  { state: 'playing', asArray: false },
  { state: 'startTime', asArray: false},
];
const youtubeUrl = (videoId) => `https://www.youtube.com/watch?v=${videoId}`;
const videoObject = (video, userName) => Object.assign({}, video, { userName });
const defaultCurrentUser = Object.assign(
  {}, { name: getAnimalName(), photoURL: '', isLogin: false }
);
 const PlayingVideoStatusText = {
  playing: 'Now Playing',
  noVideos: "There're no videos to play.",
};
const CommentType = { text: 'text', log: 'log', gif: 'gif' };
const commentObj = (content, userName, type) => Object.assign({}, { content, userName, type });
const commandType = { giphy: '/ giphy ' };

class App extends ReactBaseComponent {
  constructor(props) {
    super(props);
    this.state = this.props.app;
    this.appActions = this.props.appActions;

    this.bind('videoSearch', 'setPlayingVideo', 'notification', 'setGifUrl');
    this.bind('onKeyPressForSearch', 'onKeyPressForComment');
    this.bind('onClickSetQue', 'onClickDeleteQue');
    this.bind('onClickSignUp', 'onClickSignOut', 'onClickSignIn');
    // For YouTube Player
    this.bind('playPause', 'stop', 'setVolume', 'onSeekMouseDown', 'onSeekMouseUp', 'onSeekChange')
    this.bind('onEnded', 'onPlay', 'onProgress', 'onReady');
  }

  setLoginUser(user) {
    const { displayName, photoURL } = user;
    this.setState({
      currentUser: Object.assign({}, this.state.currentUser,
        { name: displayName, photoURL, isLogin: true }
      ),
    });
  }

  setLoginUserForSignUp(user, displayName) {
    const { photoURL } = user;
    this.setState({
      currentUser: Object.assign({}, this.state.currentUser,
        { name: displayName, photoURL, isLogin: true }
      ),
    });
  }

  componentWillMount() {
    SyncStates.forEach((obj) => {
      const { state, asArray } = obj;
      console.log(state);
      base.bindToState(state, { context: this, state, asArray });
    });
    firebaseAuth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in.
        this.setLoginUser(user);
      }
    });
  }

  componentDidMount() {
    SyncStates.forEach((obj) => {
      const { state, asArray } = obj;
      base.syncState(state, { context: this, state, asArray });
    });
    base.listenTo('startTime',{
      context: this,
      asArray: false,
      then(startTime) {
        this.setState({ played: startTime, seeking: false });
        this.player.seekTo(startTime)
      },
    });
    base.listenTo('que', {
      context: this,
      asArray: false,
      then(que) {
        if (typeof que !== 'object') {
          const addedVideo = que.pop();
          this.notification('Added♪', { body: addedVideo.title, icon: addedVideo.thumbnail.url });
        }
      },
    });
  }

  onClickSignUp() {
    const { mailAddressForSignUp, passwordForSignUp, displayName } = this.props.state;
    firebaseAuth.createUserWithEmailAndPassword(mailAddressForSignUp, passwordForSignUp)
      .then((user) => {
        user.updateProfile({ displayName });
      })
      .catch((error) => {
        console.log(error.code);
        console.log(error.message);
      });
    firebaseAuth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in.
        this.setLoginUserForSignUp(user, displayName);
      }
    });
  }

  onClickSignIn() {
    const { mailAddressForSignIn, passwordForSignIn } = this.props.state;
    firebaseAuth.signInWithEmailAndPassword(mailAddressForSignIn, passwordForSignIn)
      .then((user) => this.setLoginUser(user))
      .catch((error) => {
        console.log(error.code);
        console.log(error.message);
      });
  }

  onClickSignOut() {
    firebaseAuth.signOut()
      .then(() => this.setState({ currentUser: defaultCurrentUser }));
  }

  playPause() {
    this.setState({ playing: !this.state.playing, startTime: this.state.played });
  }

  stop() {
    if (this.state.que.length > 0) {
      this.setPlayingVideo(this.state.que[0]);
    } else {
      this.setState({ playing: false, playingVideo: '', startTime: 0 });
    }
  }

  setVolume(e) {
    this.setState({ volume: parseFloat(e.target.value) });
  }

  onSeekMouseDown() {
    this.setState({ seeking: true });
  }

  onSeekMouseUp(e) {
    this.setState({ seeking: false, startTime: parseFloat(e.target.value) });
    this.player.seekTo(parseFloat(e.target.value));
  }

  onSeekChange(e) {
    this.setState({ played: parseFloat(e.target.value) });
  }

  onProgress(state) {
    if (!this.state.seeking) { this.setState(state); }
  }

  onConfigSubmit() {
    let config;
    try {
      config = JSON.parse(this.configInput.value);
    } catch (error) {
      config = {};
      console.error('Error setting config:', error);
    }
    this.setState(config);
  }

  notification(title, option) {
    const notification = new Notification(
      `${title} (${this.state.que.length + 1} remained)`,
      { body: option.body, icon: option.icon, silent: true }
    );
    return notification;
  }

  setPlayingVideo(video) {
    this.setState({
      playing: true,
      playingVideo: video,
      startTime: 0,
      que: this.state.que.filter((item) => item.key !== video.key),
      comments: [...this.state.comments, commentObj(`play ${video.title}`, '', CommentType.log)],
    });
  }

  onPlay(video) {
    this.setState({ playing: true });
    this.notification('Now Playing♪', { body: video.title, icon: video.thumbnail.url });
  }

  onEnded() {
    if (this.state.que.length > 0) {
      this.setPlayingVideo(this.state.que[0]);
    } else {
      this.setState({ playingVideo: '', startTime: 0 });
    }
  }

  onReady() {
    console.log('onReady');
    this.setState({ playing: true });
  }

  onClickSetPlayingVideo(video) {
    this.setPlayingVideo(video);
  }

  onKeyPressForSearch(e) {
    if (e.which !== 13) return false;
    e.preventDefault();
    this.videoSearch();
    return true;
  }

  onKeyPressForComment(e) {
    if (e.which !== 13) return false;
    if (e.target.value === '') return false;
    e.preventDefault();
    const isGif = e.target.value.includes(commandType.giphy);
    if (isGif) {
      this.setGifUrl(e.target.value);
    } else {
      const comment = commentObj(e.target.value, this.state.currentUser.name, CommentType.text);
      this.setState({ comments: [...this.state.comments, comment], commentText: '' });
    }
    return true;
  }

  onClickSetQue(video) {
    const { que, currentUser } = this.state;
    const targetVideo = videoObject(video, currentUser.name);
    if (que.length === 0 && this.state.playingVideo === '') {
      this.setState({ playingVideo: targetVideo });
    } else {
      this.setState({ que: [...que, targetVideo] });
    }
  }

  onClickDeleteQue(video) {
    this.setState({ que: this.state.que.filter((item) => item.key !== video.key) });
  }

  setGifUrl(keyword) {
    const key = keyword.replace(commandType.giphy, '');
    const giphyApp = giphy({ apiKey: 'dc6zaTOxFJmzC' });
    giphyApp.random(key).then((res) => {
      const imageUrl = res.data.fixed_height_downsampled_url;
      const comment = commentObj(imageUrl, this.state.currentUser.name, CommentType.gif);
      this.setState({ comments: [...this.state.comments, comment], commentText: '' });
    });
  }

  videoSearch() {
    const youTubeNode = new YouTubeNode();
    const searchResultObj = (result) => ({
      videoId: result.id.videoId,
      title: result.snippet.title,
      thumbnail: result.snippet.thumbnails.default,
    });
    youTubeNode.setKey(YOUTUBE_API_KEY);
    youTubeNode.search(this.state.searchText, 50,
      (error, result) => {
        if (error) {
          // console.log(error);
        } else {
          this.setState({
            searchResult: result.items.map((item) => searchResultObj(item)),
          })
        }
      }
    );
  }

  render() {
    const { playerStatus, text } = this.state;
    const { playing, soundcloudConfig, vimeoConfig, youtubeConfig, fileConfig, playingVideo,
      currentUser } = this.state;
    const { isLogin, name, photoURL } = currentUser;
    const isSetPlayingVideo = playingVideo !== '';
    const { appActions } = this.appActions;

    const headerForNotLogin = (
      <div>
        <div>
          <input
            className="comment-input"
            type="text"
            placeholder="user name"
            onChange={(e) => appActions.changeText('displayName', e.target.value)}
            value={text.displayName}
          >
          </input>
          <input
            className="comment-input"
            type="text"
            placeholder="mail address"
            onChange={(e) => appActions.changeText('mailAddressForSignUp', e.target.value)}
            value={text.mailAddressForSignUp}
          >
          </input>
          <input
            className="comment-input"
            type="text"
            placeholder="password"
            onChange={(e) => appActions.changeText('passwordForSignUp', e.target.value)}
            value={text.passwordForSignUp}
          >
          </input>
          <button onClick={this.onClickSignUp}>Sign Up</button>
        </div>
        <div>
          <input
            className="comment-input"
            type="text"
            placeholder="mail address"
            onChange={(e) => appActions.changeText('mailAddressForSignIn', e.target.value)}
            value={text.mailAddressForSignIn}
          >
          </input>
          <input
            className="comment-input"
            type="text"
            placeholder="password"
            onChange={(e) => appActions.changeText('passwordForSignIn', e.target.value)}
            value={text.passwordForSignIn}
          >
          </input>
          <button onClick={this.onClickSignIn}>Sign In</button>
        </div>
      </div>
    );

    const headerForLogedin = (
      <div>
        <div>
          <p>{name}</p>
          <p>{photoURL}</p>
        </div>
        <button onClick={this.onClickSignOut}>Sign Out</button>
      </div>
    );

    const headerNode = (
      <header className="sss-header">
        {(isLogin) ? headerForLogedin : headerForNotLogin}
        {
          isSetPlayingVideo &&
            <p>
              <span className="text-small">{PlayingVideoStatusText.playing}</span>
              {playingVideo.title} {playingVideo.displayName}
            </p>
        }
        {
          !isSetPlayingVideo &&
            <p>
              <span className="text-small">{PlayingVideoStatusText.noVideos}</span>
            </p>
        }
      </header>
    );

    const searchResultNode = this.state.searchResult.map((result, i) => (
      <ul key={i} className="list-group" onClick={() => this.onClickSetQue(result)}>
        <li className="list-group-item">
          <img
            className="img-circle"
            src={result.thumbnail.url}
            width="32"
            height="32"
            alt=""
          ></img>
          <div className="media-body">
            <strong>{result.title}</strong>
          </div>
        </li>
      </ul>
    ));
    const queNode = this.state.que.map((video, i) => (
      <div key={i}>
        <li
          className="slist-group-item"
          onClick={() => this.onClickSetPlayingVideo(video)}
        >
          <img
            className="img-circle media-object pull-left"
            src={video.thumbnail.url}
            width="32"
            height="32"
            alt=""
          ></img>
          <div className="media-body">
            <strong>{video.title}</strong>
          </div>
          <p>added by {video.userName}</p>
        </li>
        <div>
          <span className="icon icon-cancel" onClick={() => this.onClickDeleteQue(video)}>x</span>
        </div>
      </div>
    ));

    const commentsNode = this.state.comments.map((comment, i) => {
      switch (comment.type) {
        case CommentType.text:
          return (
            <li key={i}>
              <p>{comment.content}</p>
              <p>{comment.userName}</p>
            </li>
          );
        case CommentType.log:
          return (
            <li key={i}>
              <p>{comment.content}</p>
              <p>{comment.userName}</p>
            </li>
          );
        case CommentType.gif:
          return (
            <li key={i}>
              <img src={comment.content} alt=""></img>
              <p>{comment.userName}</p>
            </li>
          );
        default:
          return '';
      }
    });

    return (
      <div>
        <br />
        <br />
        {headerNode}
        <div className="sss-youtube-wrapper is-covered">
          <ReactPlayer
            ref={(player) => { this.player = player; }}
            className="react-player"
            width={480}
            height={270}
            url={youtubeUrl(playingVideo.videoId)}
            playing={playing}
            volume={playerStatus.volume}
            soundcloudConfig={soundcloudConfig}
            vimeoConfig={vimeoConfig}
            youtubeConfig={youtubeConfig}
            fileConfig={fileConfig}
            onReady={this.onReady}
            onStart={() => console.log('onStart')}
            onPlay={() => this.onPlay(playingVideo)}
            onPause={() => this.setState({ playing: false })}
            onBuffer={() => console.log('onBuffer')}
            onEnded={this.onEnded}
            onError={(e) => console.log('onError', e)}
            onProgress={this.onProgress}
            onDuration={(duration) => this.setState({ duration })}
          />
        </div>
        <table><tbody>
          <tr>
            <th>Controls</th>
            <td>
              <button onClick={this.stop}>Stop</button>
              <button onClick={this.playPause}>{playing ? 'Pause' : 'Play'}</button>
            </td>
          </tr>
          <tr>
            <th>Seek</th>
            <td>
              <input
                type="range" min={0} max={1} step="any"
                value={playerStatus.played}
                onMouseDown={this.onSeekMouseDown}
                onChange={this.onSeekChange}
                onMouseUp={this.onSeekMouseUp}
              />
            </td>
          </tr>
          <tr>
            <th>Volume</th>
            <td>
              <input
                type="range" min={0} max={1} step="any" value={playerStatus.volume} onChange={this.setVolume}
              />
            </td>
          </tr>
          <tr>
            <th>Played</th>
            <td><progress max={1} value={playerStatus.played} /></td>
          </tr>
          <tr>
            <th>Loaded</th>
            <td><progress max={1} value={playerStatus.loaded} /></td>
          </tr>
        </tbody></table>
        <table><tbody>
          <tr>
            <th>played</th>
            <td>{playerStatus.played.toFixed(3)}</td>
          </tr>
          <tr>
            <th>loaded</th>
            <td>{playerStatus.loaded.toFixed(3)}</td>
          </tr>
        </tbody></table>
        <div className="controlls">
          <div className="pane comment-box">
            <ul className="comment-list-group">
              {commentsNode}
            </ul>
            <input
              className="comment-input"
              type="text"
              placeholder="type comment"
              onChange={(e) => appActions.changeText('commentText', e.target.value)}
              onKeyPress={this.onKeyPressForComment}
              value={text.commentText}
            >
            </input>
          </div>

          <div className="pane list-box">
            <h5 className="nav-group-title">
              <span className="icon icon-music"></span>
              Up Coming({this.state.que.length} videos}
            </h5>
            <ul className="list-group">
              {queNode}
            </ul>
          </div>

          <div className="pane">
            <ul className="list-group">
              <li className="list-group-header">
                <span className="icon icon-search"></span>
                <input
                  className="form-control"
                  type="text"
                  placeholder="Search for something you want"
                  onChange={(e) => appActions.changeText('searchText', e.target.value)}
                  onKeyPress={this.onKeyPressForSearch}
                  value={text.searchText}
                >
                </input>
              </li>
            </ul>
            <h5 className="nav-group-title">Search Result</h5>
            {searchResultNode}
          </div>

        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return { app: state.app };
}

const mapDispatchToProps = (dispatch) => {
  return {
    appActions: bindActionCreators(AppActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
