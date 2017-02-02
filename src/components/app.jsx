import React from 'react';
import ReactBaseComponent from './reactBaseComponent';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as AppActions from '../actions/app';
import { SyncStates, YoutubeApiUrl } from '../constants/app';
import { base, firebaseAuth } from '../config/firebaseApp';
import classNames from 'classnames';
import { DefaultVideo } from '../constants/app';
import ReactPlayer from 'react-player';
import 'whatwg-fetch';
import Loading from 'react-loading';
// Components
import Header from './header';
import SearchResult from './searchResult';
import Comments from './comments';
// Styles
import '../styles/base.scss';
import '../styles/normalize.scss';

const channelsParams = (user) => (
  `access_token=${user.accessToken}&part=contentDetails&mine=true`
);

const youtubeUrl = (id) => `https://www.youtube.com/watch?v=${id}`;

class App extends ReactBaseComponent {
  constructor(props) {
    super(props);
    this.bind('notification');
    this.bind('onSeekMouseUp');
  }

  onSeekMouseUp(e) {
    const played = parseFloat(e.target.value);
    this.props.appActions.seekUp(played);
    this.player.seekTo(played);
  }

  getPlaylist(user) {
    fetch(`${YoutubeApiUrl}/channels?${channelsParams(user)}`)
      .then((response) => { return response.json(); })
      .then((json) => {
        const base = json.items[0].contentDetails.relatedPlaylists;
        const lists = Object.keys(base)
                            .map((k) => ({ id: base[k], title: k, thumbnailUrl: ''}))
        this.props.appActions.setPlaylists(lists)
      })
  }

  componentWillMount() {
    firebaseAuth.getRedirectResult().then((result) => {
      if (result.credential) {
        const { accessToken } = result.credential;
        const { uid, displayName, photoURL } = result.user;
        const user = { name: displayName, photoURL, accessToken, uid };
        this.props.appActions.postUser(uid, user);
        this.props.appActions.setUser(user);
      }
    })
    firebaseAuth.onAuthStateChanged((user) => {
      if (user) {
        base.listenTo(`users/${user.uid}`, { context: this, asArray: true, then(data) {
          if(data.length > 0) {
            this.props.appActions.setUser(data[0]);
            this.getPlaylist(data[0]);
          } else {
            const { displayName, photoURL, uid } = user;
            const tempUser = { name: displayName, photoURL, uid, accessToken: '' };
            this.props.appActions.setUser(tempUser);
            this.getPlaylist(tempUser);
          }
        }})
      } else {
        this.props.appActions.setDefaultUser();
      }
    })
  }

  componentDidMount() {
    const { appActions } = this.props;
    SyncStates.forEach((obj, i) => {
      const { state, asArray } = obj;
      base.fetch(state, { context: this, asArray, then(data) {
        appActions.updateSyncState(state, data);
        (i + 1 === SyncStates.length) && appActions.changeValueWithKey('isLoadedSyncState', true);
      }});
    });
    base.listenTo('startTime', { context: this, asArray: false, then(startTime) {
      appActions.updatePlayed(startTime);
      this.player.seekTo(startTime);
    }});
    base.listenTo('playing', { context: this, asArray: false, then(playing) {
      appActions.updatePlaying(playing);
    }});
    base.listenTo('que', { context: this, asArray: true, then(que) {
      appActions.updateQue(que);
    }});
    base.listenTo('comments', { context: this, asArray: true, then(comments) {
      appActions.updateComments(comments);
    }});
    base.listenTo('users', { context: this, asArray: true, then(users) {
      appActions.updateUsers(users);
    }});
    base.listenTo('playingVideo', { context: this, asArray: false, then(video) {
      appActions.updatePlayingVideo(video);
    }});
  }

  componentWillUnmount(){
    this.props.appActions.removeUser(this.props.app.currentUser.uid);
    this.props.appActions.changePlayed(this.props.app.played);
  }

  notification(title, option) {
    const notification = new Notification(
      `${title} (${this.props.app.que.length + 1} remained)`,
      { body: option.body, icon: option.icon, silent: true }
    );
    return notification;
  }

  render() {
    const { app, appActions } = this.props;
    const isPostPlayingVideo = app.playingVideo !== '';
    const playingVideo = app.playingVideo || DefaultVideo;

    return (
      <div className="contents">
        <header className="header-bar">
          <Header app={app} appActions={appActions} />
        </header>
        <div className="main-display">
          {!app.isLoadedSyncState && <Loading type='spinningBubbles' color='#26BFBA' />}
          <div className="display-youtube">
            <ReactPlayer
              ref={(player) => { this.player = player; }}
              className="react-player"
              width={"100%"}
              height={"100%"}
              url={youtubeUrl(playingVideo.id)}
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
              onProgress={appActions.progress}
              onDuration={(duration) => appActions.changeValueWithKey('duration', duration)}
            />
          </div>
          <Comments app={app} appActions={appActions} />
          <SearchResult app={app} appActions={appActions}/>
        </div>
        <div className="footer-bar">
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
                  <span className="header-bar__text--message">No video</span>
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
            <p className="volume-box__ttl" onClick={() => appActions.changeVolume(0)}>
              mute
            </p>
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
