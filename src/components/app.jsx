import React from 'react';
import ReactBaseComponent from './reactBaseComponent.jsx';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as AppActions from '../actions/app';
import Reactotron from 'reactotron-react-js'
import { YOUTUBE_API_KEY } from '../config/api_key.js';
import { base, firebaseAuth } from '../config/firebaseApp.js';
import YouTubeNode from 'youtube-node';
import ReactPlayer from 'react-player';
import giphy from 'giphy-api';
// import '../styles/test.scss';

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
const PlayingVideoStatusText = {
  playing: 'Now Playing',
  noVideos: "There're no videos to play.",
};
const CommentType = { text: 'text', log: 'log', gif: 'gif' };
const commentObj = (content, userName, type, keyword) => (
  Object.assign({}, { content, userName, type, keyword })
);
const commandType = { giphy: '/ giphy ' };

class App extends ReactBaseComponent {
  constructor(props) {
    super(props);
    this.bind('notification', 'setGifUrl');
    this.bind('onKeyPressForSearch', 'onKeyPressForComment');
    this.bind('onClickSetQue');
    this.bind('onClickSignUp', 'onClickSignOut', 'onClickSignIn');
    // For YouTube Player
    this.bind('onSeekMouseUp', 'onProgress')
  }

  componentWillMount() {
    firebaseAuth.onAuthStateChanged((user) => {
      user && this.props.appActions.setUser(user, true)
    });
    SyncStates.forEach((obj) => {
      const { state, asArray } = obj;
      base.fetch(state, {
        context: this, asArray,
        then(data) { this.props.appActions.fetchSyncState(state, data) },
      });
    })
  }

  componentDidMount() {
    base.listenTo('startTime',{
      context: this,
      asArray: false,
      then(startTime) {
        this.props.appActions.changePlayed(startTime);
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
    const { mailAddressForSignUp, passwordForSignUp, displayName } = this.props.app;
    firebaseAuth.createUserWithEmailAndPassword(mailAddressForSignUp, passwordForSignUp)
      .then((user) => {
        user.updateProfile({ displayName });
      })
      .catch((error) => {
        Reactotron.log(error.code);
        Reactotron.log(error.message);
      });
    firebaseAuth.onAuthStateChanged((user) => {
      user && this.props.appActions.setUser({ name: displayName, photoURL: user.photoURL }, true)
    });
  }

  onClickSignIn() {
    const { mailAddressForSignIn, passwordForSignIn } = this.props.app;
    firebaseAuth.signInWithEmailAndPassword(mailAddressForSignIn, passwordForSignIn)
      .then((user) => {
        this.props.appActions.setUser({ name: user.displayName, photoURL: user.photoURL }, true)
      })
      .catch((error) => {
        Reactotron.log(error.code);
        Reactotron.log(error.message);
      });
  }

  onClickSignOut() {
    firebaseAuth.signOut().then(() => this.props.appActions.setDefaultUser());
  }

  onSeekMouseUp(e) {
    const played = parseFloat(e.target.value)
    this.props.appActions.seekUp(played);
    this.player.seekTo(played);
  }

  notification(title, option) {
    const notification = new Notification(
      `${title} (${this.props.app.que.length + 1} remained)`,
      { body: option.body, icon: option.icon, silent: true }
    );
    return notification;
  }

  onKeyPressForSearch(e) {
    if (e.which !== 13) return false;
    e.preventDefault();
    const searchFunc = (error, result) => {
      (error) ?  Reactotron.log(error) : this.props.appActions.setSearchResult(result)
    }
    const youTubeNode = new YouTubeNode();
    youTubeNode.setKey(YOUTUBE_API_KEY);
    youTubeNode.search(this.props.app.searchText, 50, (error, result) => searchFunc(error, result));
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
      const comment = commentObj(e.target.value, this.props.app.currentUser.name, CommentType.text);
      this.props.appActions.addComment(comment);
    }
    return true;
  }

  onClickSetQue(video) {
    const { que, currentUser, playingVideo } = this.props.app;
    const targetVideo = videoObject(video, currentUser.name);
    if (que.length === 0 && playingVideo === '') {
      this.props.appActions.setPlayingVideo(targetVideo);
    } else {
      this.props.appActions.addVideo(targetVideo);
    }
  }

  setGifUrl(keyword) {
    const key = keyword.replace(commandType.giphy, '');
    const giphyApp = giphy({ apiKey: 'dc6zaTOxFJmzC' });
    giphyApp.random(key).then((res) => {
      const imageUrl = res.data.fixed_height_downsampled_url;
      const comment = commentObj(imageUrl, this.state.currentUser.name, CommentType.gif, key);
      this.props.appActions.addComment(comment);
    });
  }

  onProgress(state) {
    this.props.appActions.progress(state);
  }

  render() {
    const { app, appActions } = this.props;
    const { isLogin, name, photoURL } = app.currentUser;
    const isSetPlayingVideo = app.playingVideo !== '';

    const headerForNotLogin = (
      <div>
        <div>
          <input
            className="comment-input"
            type="text"
            placeholder="user name"
            onChange={(e) => appActions.changeText('displayName', e.target.value)}
            value={app.displayName}
          >
          </input>
          <input
            className="comment-input"
            type="text"
            placeholder="mail address"
            onChange={(e) => appActions.changeText('mailAddressForSignUp', e.target.value)}
            value={app.mailAddressForSignUp}
          >
          </input>
          <input
            className="comment-input"
            type="text"
            placeholder="password"
            onChange={(e) => appActions.changeText('passwordForSignUp', e.target.value)}
            value={app.passwordForSignUp}
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
            value={app.mailAddressForSignIn}
          >
          </input>
          <input
            className="comment-input"
            type="text"
            placeholder="password"
            onChange={(e) => appActions.changeText('passwordForSignIn', e.target.value)}
            value={app.passwordForSignIn}
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
              {app.playingVideo.title} {app.playingVideo.displayName}
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

    const searchResultNode = app.searchResult.map((result, i) => (
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
    const queNode = app.que.map((video, i) => (
      <div key={i}>
        <li
          className="slist-group-item"
          onClick={() => appActions.setPlayingVideo(video)}
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
          <span className="icon icon-cancel" onClick={() => appActions.deleteVideo(video, i)}>x</span>
        </div>
      </div>
    ));

    const commentsNode = app.comments.map((comment, i) => {
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
            url={youtubeUrl(app.playingVideo.videoId)}
            playing={app.playing}
            volume={app.volume}
            soundcloudConfig={app.soundcloudConfig}
            vimeoConfig={app.vimeoConfig}
            youtubeConfig={app.youtubeConfig}
            fileConfig={app.fileConfig}
            onReady={() => appActions.play()}
            onStart={() => Reactotron.log('onStart')}
            onPlay={() => appActions.play()}
            onPause={() => appActions.pause(app.played)}
            onBuffer={() => Reactotron.log('onBuffer')}
            onEnded={() => appActions.setPlayingVideo(app.que[0])}
            onError={(e) => Reactotron.log('onError', e)}
            onProgress={this.onProgress}
            onDuration={(duration) => this.setState({ duration })}
          />
        </div>
        <table><tbody>
          <tr>
            <th>Controls</th>
            <td>
              <button onClick={() => appActions.setPlayingVideo(app.que[0])}>Skip</button>
              <button onClick={() => appActions.playPause(app.playing)}>{app.playing ? 'Pause' : 'Play'}</button>
            </td>
          </tr>
          <tr>
            <th>Seek</th>
            <td>
              <input
                type="range" min={0} max={1} step="any"
                value={app.played}
                onMouseDown={appActions.seekDown}
                onChange={(e) => appActions.changePlayed(parseFloat(e.target.value))}
                onMouseUp={this.onSeekMouseUp}
              />
            </td>
          </tr>
          <tr>
            <th>Volume</th>
            <td>
              <input
                type="range"
                min={0}
                max={1}
                step="any"
                value={app.volume} onChange={(e) => appActions.changeVolume(e.target.value)}
              />
            </td>
          </tr>
          <tr>
            <th>Played</th>
            <td><progress max={1} value={app.played} /></td>
          </tr>
          <tr>
            <th>Loaded</th>
            <td><progress max={1} value={app.loaded} /></td>
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
              value={app.commentText}
            >
            </input>
          </div>
          <div className="pane list-box">
            <h5 className="nav-group-title">
              <span className="icon icon-music"></span>
              Up Coming({app.que.length} videos}
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
                  value={app.searchText}
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

App.propTypes = {
  app: React.PropTypes.object,
  appActions: React.PropTypes.object,
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
