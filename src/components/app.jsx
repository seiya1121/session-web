import React from 'react';
import ReactBaseComponent from './reactBaseComponent';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as AppActions from '../actions/app';
import { YOUTUBE_API_KEY } from '../config/apiKey';
import { SyncStates, CommandType, CommentType, DefaultVideo } from '../constants/app';
import { base, firebaseAuth, provider } from '../config/firebaseApp';
import YouTubeNode from 'youtube-node';
import ReactPlayer from 'react-player';
import classNames from 'classnames';
import giphy from 'giphy-api';
import 'whatwg-fetch';
import '../styles/base.scss';
import '../styles/normalize.scss';

const youtubeUrl = (videoId) => `https://www.youtube.com/watch?v=${videoId}`;
const videoObject = (video, userName) => Object.assign({}, video, { userName });
const commentObj = (content, user, type, keyword) => (
  Object.assign({}, { content, user, type, keyword })
);

const YoutubeUrl = 'https://www.googleapis.com/youtube/v3';
const channelsParams = (user) => (
  `access_token=${user.accessToken}&part=contentDetails&mine=true`
);
const playlistItemsParams = (accessToken, playlistId) => (
  `access_token=${accessToken}&part=snippet&playlistId=${playlistId}&maxResults=50`
)
class App extends ReactBaseComponent {
  constructor(props) {
    super(props);
    this.bind('notification', 'setGifUrl', 'getPlaylistVideos');
    this.bind('onKeyPressForSearch', 'onKeyPressForComment');
    this.bind('onClickSetQue', 'onClickSignOut', 'onClickSignIn');
    // For YouTube Player
    this.bind('onSeekMouseUp', 'onProgress');
  }

  componentWillMount() {
    firebaseAuth.getRedirectResult().then((result) => {
      if (result.credential) {
        const { accessToken } = result.credential;
        const { uid, displayName, photoURL } = result.user;
        this.props.appActions.postUser(uid, { name: displayName, photoURL, accessToken, uid });
      }
    })
    firebaseAuth.onAuthStateChanged((user) => {
      if (user) {
        base.listenTo(`users/${user.uid}`, {
          context: this,
          asArray: true,
          then(data) {
            this.props.appActions.setUser(data[0]);
            fetch(`${YoutubeUrl}/channels?${channelsParams(data[0])}`)
              .then((response) => { return response.json(); })
              .then((json) => {
                this.props.appActions.setPlaylists(json.items[0].contentDetails.relatedPlaylists)
              })
          }
        })
      } else {
        this.props.appActions.setDefaultUser();
      }
    })
    SyncStates.forEach((obj) => {
      const { state, asArray } = obj;
      base.fetch(state, {
        context: this, asArray,
        then(data) { this.props.appActions.updateSyncState(state, data); },
      });
    });
  }

  componentDidMount() {
    base.listenTo('startTime', {
      context: this,
      asArray: false,
      then(startTime) {
        this.props.appActions.updatePlayed(startTime);
        this.player.seekTo(startTime);
      },
    });
    base.listenTo('playing', {
      context: this,
      asArray: false,
      then(playing) {
        this.props.appActions.updatePlaying(playing);
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
    base.listenTo('users', {
      context: this,
      asArray: true,
      then(users) { this.props.appActions.updateUsers(users); },
    });
    base.listenTo('playingVideo', {
      context: this,
      asArray: false,
      then(video) { this.props.appActions.updatePlayingVideo(video); },
    });
  }

  getPlaylistVideos(playlistId) {
    const {accessToken} = this.props.app.currentUser;
    fetch(`${YoutubeUrl}/playlistItems?${playlistItemsParams(accessToken, playlistId)}`)
      .then((response) => response.json())
      .then((result) => this.props.appActions.setSearchResultForPlaylist(result))
  }

  onClickSignIn() {
    provider.addScope('https://www.googleapis.com/auth/youtube');
    firebaseAuth.signInWithRedirect(provider)
  }

  onClickSignOut() {
    const { uid } = this.props.app.currentUser;
    firebaseAuth.signOut().then(() => {
      this.props.appActions.removeUser(uid);
      this.props.appActions.setDefaultUser();
    });
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
        console.log(result)
        this.props.appActions.setSearchResult(result);
      }
    };
    this.props.appActions.changeValueWithKey('searchedText', this.props.app.searchText);
    const youTubeNode = new YouTubeNode();
    youTubeNode.setKey(YOUTUBE_API_KEY);
    youTubeNode.addParam('type', 'video');
    youTubeNode.search(this.props.app.searchText, 50, (error, result) => searchFunc(error, result));
    return true;

  }

  onKeyPressForComment(e) {
    if (e.which !== 13) return false;
    if (e.target.value === '') return false;
    e.preventDefault();
    const commentText = e.target.value;
    const isGif = commentText.includes(CommandType.giphy);
    if (isGif) {
      this.setGifUrl(commentText);
    } else {
      const comment = commentObj(
        commentText,
        this.props.app.currentUser,
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
      this.props.appActions.postPlayingVideo(targetVideo);
    } else {
      this.props.appActions.pushVideo(targetVideo);
    }
  }

  setGifUrl(keyword) {
    const key = keyword.replace(CommandType.giphy, '');
    const giphyApp = giphy({ apiKey: 'dc6zaTOxFJmzC' });
    giphyApp.random(key).then((res) => {
      const imageUrl = res.data.fixed_height_downsampled_url;
      const comment = commentObj(imageUrl, this.props.app.currentUser, CommentType.gif, key);
      this.props.appActions.addComment(comment);
    });
  }

  onProgress(state) {
    this.props.appActions.progress(state);
  }

  render() {
    const { app, appActions } = this.props;
    const { accessToken, name, photoURL } = app.currentUser;
    const isLogin = accessToken;
    const isPostPlayingVideo = app.playingVideo !== '';
    const comments = (app.isCommentActive) ?
      app.comments : app.comments.slice(app.comments.length - 3, app.comments.length);
    const playingVideo = app.playingVideo || DefaultVideo;

    const usersNode = app.users.map((user, i) => (
      <img key={i} src={user.photoURL} alt={user.name} />
    ));

    const headerNode = (
      <header className="header-bar">
        <div className="header-bar__left">
          <div className="header-bar-prof">
            <img className="header-bar-prof__icon" src={photoURL} alt="" />
            <p className="header-bar-prof__name">
              {name}
              {
                (isLogin) ?
                  <a className="header-bar-prof__sign" onClick={this.onClickSignOut}>Sign Out</a> :
                  <a className="header-bar-prof__sign" onClick={this.onClickSignIn}>Sign In</a>
              }
            </p>
          </div>
          {usersNode}
        </div>
        <input
          className={classNames('form-search', { 'is-search-active': app.isSearchActive })}
          type="text"
          placeholder="Search videos"
          onChange={(e) => { appActions.changeValueWithKey('searchText', e.target.value); }}
          onFocus={() => { appActions.changeValueWithKey('isSearchActive', true); }}
          onKeyPress={this.onKeyPressForSearch}
          value={app.searchText}
        >
        </input>
        <div
          className={classNames('button-que-list', { 'is-quelist-list': app.isQueListActive })}
          onClick={() => appActions.changeValueWithKey('isQueListActive', !app.isQueListActive)}
        >
          <span />
          <span />
          <span />
        </div>
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

    const queNode = app.que.map((video) => (
      <li key={video.key} className="list-group-item">
        <div
          className="list-group-item__click"
          onClick={() => appActions.postPlayingVideo(video)}
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
        <div className="list-group-item__close" onClick={() => appActions.removeVideo(video)}>
        </div>
      </li>
    ));

    const playlistNamesNode = Object.keys(app.playlists).map((list, i) => (
      <li key={i}>
        <button onClick={() => this.getPlaylistVideos(app.playlists[list])}>
          {list}
        </button>
      </li>
    ));

    const commentClass = (type, index) => (
      (type === CommentType.log) ?
        classNames(
          'comments-stream__item--play',
          { [`comments-stream__item--play_${index}`]: !app.isCommentActive },
        ) :
        classNames(
          'comments-stream__item',
          { [`comments-stream__item_${index}`]: !app.isCommentActive },
        )
    );

    const commentsNode = comments.map((comment, i) => {
      switch (comment.type) {
        case CommentType.text:
          return (
            <li key={i} className={commentClass(comment.type, i)}>
              <img
                className="comments-stream__img-prof"
                src={comment.user.photoURL}
                alt={comment.user.name}
              />
              <div className="commemt-comment">
                <div className="comment-single">
                  {comment.content}
                </div>
                <div className="comment-author">
                  {comment.user.name}
                </div>
              </div>
            </li>
          );
        case CommentType.log:
          return (
            <li key={i} className={commentClass(comment.type, i)}>
              {comment.content} by {comment.userName}
            </li>
          );
        case CommentType.gif:
          return (
            <li key={i} className={commentClass(comment.type, i)}>
              <p>{comment.keyword}</p>
              <img className="comments-stream__img-giphy" src={comment.content} alt=""></img>
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
              url={youtubeUrl(playingVideo.videoId)}
              playing={app.playing}
              volume={app.volume}
              soundcloudConfig={app.soundcloudConfig}
              vimeoConfig={app.vimeoConfig}
              youtubeConfig={app.youtubeConfig}
              fileConfig={app.fileConfig}
              onReady={() => appActions.play()}
              onPlay={() => appActions.play()}
              onPause={() => appActions.pause(app.played)}
              onEnded={() => appActions.postPlayingVideo(app.que[0])}
              onError={() => appActions.postPlayingVideo(app.que[0])}
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
              className={classNames('comment-input', { 'is-active': !app.isCommentActive })}
              type="text"
              placeholder="type comment"
              onChange={(e) => { appActions.changeValueWithKey('commentText', e.target.value); }}
              onFocus={() => { appActions.changeValueWithKey('isCommentActive', true); }}
              onBlur={() => { appActions.changeValueWithKey('isCommentActive', false); }}
              onKeyPress={this.onKeyPressForComment}
              value={app.commentText}
            >
            </input>
          </div>

          <div
            className={classNames(
              'display-control',
              { 'is-search-active': app.isSearchActive },
              { 'is-quelist-list': app.isQueListActive },
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
              <div
                className="display-search__close"
                onClick={() => appActions.changeValueWithKey('isSearchActive', false)}
               />
              <p className="list-group-title">
                search for
                <span className="list-group-title__number">{app.searchedText}</span>
                {playlistNamesNode}
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
              className="play-controll__skip"
              onClick={() => appActions.postPlayingVideo(app.que[0])}
            >&nbsp;</button>
          </div>

          <div className="progress-box">
            {
              isPostPlayingVideo &&
                <p className="progress-box__ttl">
                  {playingVideo.title} {playingVideo.displayName}
                </p>
            }
            {
              !isPostPlayingVideo &&
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
};

const mapStateToProps = (state) => ({ app: state.app });

const mapDispatchToProps = (dispatch) => ({
  appActions: bindActionCreators(AppActions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
