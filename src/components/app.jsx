import React from 'react';
import ReactBaseComponent from './reactBaseComponent';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as AppActions from '../actions/app';
import { YOUTUBE_API_KEY } from '../config/apiKey';
import { base, firebaseAuth } from '../config/firebaseApp';
import YouTubeNode from 'youtube-node';
import ReactPlayer from 'react-player';
import classNames from 'classnames';
import giphy from 'giphy-api';
import '../styles/base.scss';
import '../styles/normalize.scss';

const SyncStates = [
  { state: 'que', asArray: true },
  { state: 'users', asArray: true },
  { state: 'comments', asArray: true },
  { state: 'playingVideo', asArray: false },
  { state: 'playing', asArray: false },
  { state: 'startTime', asArray: false },
];

const youtubeUrl = (videoId) => `https://www.youtube.com/watch?v=${videoId}`;
const videoObject = (video, userName) => Object.assign({}, video, { userName });
const CommentType = { text: 'text', log: 'log', gif: 'gif' };
const commentObj = (content, userName, type, keyword) => (
  Object.assign({}, { content, userName, type, keyword })
);
const commandType = { giphy: '/giphy ' };

class App extends ReactBaseComponent {
  constructor(props) {
    super(props);
    this.bind('notification', 'setGifUrl');
    this.bind('onKeyPressForSearch', 'onKeyPressForComment');
    this.bind('onClickSetQue', 'onClickSignUp', 'onClickSignOut', 'onClickSignIn');
    // For YouTube Player
    this.bind('onSeekMouseUp', 'onProgress');
  }

  componentWillMount() {
    firebaseAuth.onAuthStateChanged((user) => {
      // if (user) { this.props.appActions.setUser(user, true); }
      if (user) { this.props.appActions.setDefaultUser(); }
    });
    SyncStates.forEach((obj) => {
      const { state, asArray } = obj;
      base.fetch(state, {
        context: this, asArray,
        then(data) { this.props.appActions.fetchSyncState(state, data); },
      });
    });
  }

  componentDidMount() {
    base.listenTo('startTime', {
      context: this,
      asArray: false,
      then(startTime) {
        this.props.appActions.changePlayed(startTime);
        this.player.seekTo(startTime);
      },
    });
    base.listenTo('que', {
      context: this,
      asArray: true,
      then(que) { this.props.appActions.updateQue(que); },
    });
    base.listenTo('comments', {
      context: this,
      asArray: true,
      then(comments) { this.props.appActions.updateComments(comments); },
    });
    base.listenTo('playingVideo', {
      context: this,
      asArray: false,
      then(video) {
        this.props.appActions.setPlayingVideo(video);
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
        console.log(error.code);
        console.log(error.message);
      });
    firebaseAuth.onAuthStateChanged((user) => {
      if (user) {
        this.props.appActions.setUser({ name: displayName, photoURL: user.photoURL }, true);
      }
    });
  }

  onClickSignIn() {
    const { mailAddressForSignIn, passwordForSignIn } = this.props.app;
    firebaseAuth.signInWithEmailAndPassword(mailAddressForSignIn, passwordForSignIn)
      .then((user) => {
        this.props.appActions.setUser({ name: user.displayName, photoURL: user.photoURL }, true);
      })
      .catch((error) => {
        console.log(error.code);
        console.log(error.message);
      });
  }

  onClickSignOut() {
    firebaseAuth.signOut().then(() => this.props.appActions.setDefaultUser());
  }

  onSeekMouseUp(e) {
    const played = parseFloat(e.target.value);
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
      if (error) {
        console.log(error);
      } else {
        this.props.appActions.setSearchResult(result);
      }
    };
    const youTubeNode = new YouTubeNode();
    youTubeNode.setKey(YOUTUBE_API_KEY);
    youTubeNode.search(this.props.app.searchText, 50, (error, result) => searchFunc(error, result));
    return true;
  }

  onKeyPressForComment(e) {
    if (e.which !== 13) return false;
    if (e.target.value === '') return false;
    e.preventDefault();
    const commentText = e.target.value;
    const isGif = commentText.includes(commandType.giphy);
    if (isGif) {
      this.setGifUrl(commentText);
    } else {
      const comment = commentObj(
        commentText,
        this.props.app.currentUser.name,
        CommentType.text,
        ''
      );
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
      const comment = commentObj(imageUrl, this.props.app.currentUser.name, CommentType.gif, key);
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
      <div className="none">
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
      <div className="none">
        <div>
          <p>{name}</p>
          <p>{photoURL}</p>
        </div>
        <button onClick={this.onClickSignOut}>Sign Out</button>
      </div>
    );

    const headerNode = (
      <header className="header-bar">
        {/* ログイン機能、レイアウト考える上でめんどいから一旦非表示 */}
        {(isLogin) ? headerForLogedin : headerForNotLogin}

        <input
          className={classNames(
            'form-search',
            { 'is-search-active': app.isSearchActive },
          )}
          type="text"
          placeholder="Search videos"
          onChange={(e) => appActions.changeSearchText(e.target.value)}
          onKeyPress={this.onKeyPressForSearch}
          value={app.searchText}
        >
        </input>
      </header>
    );

    const searchResultNode = app.searchResult.map((result, i) => (
      <li
        key={i}
        className="list-group-item"
        onClick={() => this.onClickSetQue(result)}
      >
        <div
          className="list-group-item__click"
        >
          <img
            className="list-group-item__thumbnail"
            src={result.thumbnail.url}
            alt=""
          />
          <div className="list-group-item__body">
            <strong>{result.title}</strong>
          </div>
        </div>
      </li>
    ));

    const queNode = app.que.map((video, i) => (
      <li key={i} className="list-group-item">
        <div
          className="list-group-item__click"
          onClick={() => appActions.setPlayingVideo(video)}
        >
          <img
            className="list-group-item__thumbnail"
            src={video.thumbnail.url}
            alt=""
          />
          <div className="list-group-item__body">
            <strong>{video.title}</strong>
            <p className="list-group-item__name">added by {video.userName}</p>
          </div>
        </div>
        <div className="list-group-item__close" onClick={() => appActions.deleteVideo(video, i)}>
        </div>
      </li>
    ));

    const commentsNode = app.comments.map((comment, i) => {
      switch (comment.type) {
        case CommentType.text:
          return (
            <li key={i} className="comments-stream__item">
              <div className="comment-single">
                {comment.content}
              </div>
              <div className="comment-author">
                {comment.userName}
              </div>
            </li>
          );
        case CommentType.log:
          return (
            <li key={i} className="comments-stream__item--play">
              {comment.content}
              {comment.userName}
            </li>
          );
        case CommentType.gif:
          return (
            <li key={i} className="comments-stream__item">
              <p>{comment.keyword}</p>
              <img src={comment.content} alt=""></img>
              <div className="comment-author">
                {comment.userName}
              </div>
            </li>
          );
        default:
          return '';
      }
    });

    return (
      <div className="contents">
        {headerNode}

        <div className="main-display">
          {/* youotube */}
          <div className="display-youtube">
            <ReactPlayer
              ref={(player) => { this.player = player; }}
              className="react-player"
              width={"100%"}
              height={"100%"}
              url={youtubeUrl(app.playingVideo.videoId)}
              playing={app.playing}
              volume={app.volume}
              soundcloudConfig={app.soundcloudConfig}
              vimeoConfig={app.vimeoConfig}
              youtubeConfig={app.youtubeConfig}
              fileConfig={app.fileConfig}
              onReady={() => appActions.play()}
              onStart={() => console.log('onStart')}
              onPlay={() => appActions.play()}
              onPause={() => appActions.pause(app.played)}
              onBuffer={() => console.log('onBuffer')}
              onEnded={() => appActions.setPlayingVideo(app.que[0])}
              onError={(e) => console.log('onError', e)}
              onProgress={this.onProgress}
              onDuration={(duration) => appActions.changeValueWithKey('duration', duration)}
            />
          </div>

          {/* comment */}
          <div className="display-comments">
            <ul className="comments-stream">
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

          <div
            className={classNames(
              'display-control',
              { 'is-search-active': app.isSearchActive },
            )}
          >
            {/* Play list */}
            <div className="display-list">
              <p className="list-group-title">
                Up Coming <span className="list-group-title__number">{app.que.length}</span>
              </p>
              <ul className="list-group">
                {queNode}
              </ul>
            </div>

            {/* Search */}
            <div className="display-search">
              <p className="list-group-title">
                search for
                <span className="list-group-title__number">{app.searchText}</span>
              </p>
              <ul className="list-group">
                {searchResultNode}
              </ul>
            </div>
          </div>

        </div>

        <div className="footer-bar">
          {/* progress */}

          <div className="play-controll">
            <button
              className={classNames(
                { 'play-controll__pause': app.playing },
                { 'play-controll__play': !app.playing },
              )}
              onClick={() => appActions.playPause(app.playing)}
            >
              &nbsp;
            </button>
            <button
              className="play-controll__stop"
              onClick={() => appActions.setPlayingVideo(app.que[0])}
            >&nbsp;</button>
          </div>

          <div className="progress-box">
            {
              isSetPlayingVideo &&
                <p className="progress-box__ttl">
                  {app.playingVideo.title} {app.playingVideo.displayName}
                </p>
            }
            {
              !isSetPlayingVideo &&
                <p className="progress-box__ttl">
                  <span className="header-bar__text--message">There're no videos to play.</span>
                </p>
            }
            <div className="progress-bar">
              <input
                className="progress-bar__seek"
                type="range" min={0} max={1} step="any"
                value={app.played}
                onMouseDown={appActions.seekDown}
                onChange={(e) => appActions.changePlayed(parseFloat(e.target.value))}
                onMouseUp={this.onSeekMouseUp}
              />
              <div
                className="progress-bar__played"
                style={{ width: `${100 * app.played}%` }}
              ></div>
              <div
                className="progress-bar__loaded"
                style={{ width: `${100 * app.loaded}%` }}
              ></div>
            </div>
            <div className="progress-box__status">
              <p>played {app.played.toFixed(3)} / loaded {app.loaded.toFixed(3)}</p>
            </div>
          </div>

          <div className="volume-box">
            <p className="volume-box__ttl">
              Volume
            </p>
            <div className="volume-box__range-wrap">
              <input
                className="volume-box__range"
                type="range"
                min={0}
                max={1}
                step="any"
                value={app.volume}
                onChange={(e) => appActions.changeVolume(e.target.value)}
              />
            </div>
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
