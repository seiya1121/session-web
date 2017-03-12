import React from 'react';
import ReactBaseComponent from './reactBaseComponent';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as AppActions from '../actions/app';
import { YoutubeApiUrl } from '../action_types/app';
import { base, firebaseAuth } from '../config/firebaseApp';
import 'whatwg-fetch';
import classNames from 'classnames';
import { DefaultVideo } from '../action_types/app';

// Components
import Header from './header';
import SearchResult from './searchResult';
import Comments from './comments';
import Player from './player'

// Styles
import '../styles/base.scss';
import '../styles/normalize.scss';

const channelsParams = (user) => (
  `access_token=${user.accessToken}&part=contentDetails&mine=true`
);

const userObj = ({ displayName, photoURL, uid, isAnonymous }, overrideState) => Object.assign(
  { displayName, photoURL, uid, isAnonymous }, overrideState
);

class App extends ReactBaseComponent {
  constructor(props) {
    super(props);
    this.bind('notification');
    this.bind('getPlaylist', 'onUnload');
				this.bind('onSeekMouseUp');
  }

		componentWillMount() {
				firebaseAuth.getRedirectResult().then((result) => {
						if (result.credential) {
								const { accessToken } = result.credential;
								const user = userObj(result.user, { accessToken, isHere: true });
								this.props.actions.postUser(user.uid, user);
								this.props.actions.setUser(user);
						}
				})
				firebaseAuth.onAuthStateChanged((user) => {
						if (user) {
								if (user.isAnonymous) {
										const temp = { displayName: 'User', photoURL: '../images/avatar.png', uid: user.uid, isAnonymous: user.isAnonymous };
										const u = userObj(temp, { accessToken: '', isHere: true });
										this.props.actions.postUser(u.uid, u);
										this.props.actions.setUser(u);
								} else {
										base.listenTo(`users/${user.uid}`, { context: this, asArray: false, then(data) {
												if(data) {
														const u = userObj(data, { accessToken: data.accessToken, isHere: true });
														this.props.actions.postUser(u.uid, u);
														this.props.actions.setUser(u);
														this.getPlaylist(u);
												} else {
														const u = userObj(user, { accessToken: '', isHere: true });
														this.props.actions.postUser(u.uid, u);
														this.props.actions.setUser(u);
														this.getPlaylist(u);
												}
										}});
								}
						} else {
								firebaseAuth.signInAnonymously();
						}
				})
		}

		componentDidMount() {
				window.addEventListener("beforeunload", this.onUnload);
				const { actions } = this.props;
				base.listenTo('startTime', { context: this, asArray: false, then(startTime) {
						actions.updatePlayed(startTime);
						this.player.seekTo(startTime);
				}});
				base.listenTo('playing', { context: this, asArray: false, then(playing) {
						actions.updatePlaying(playing);
				}});
				base.listenTo('users', { context: this, asArray: true, then(users) {
						actions.updateUsers(users);
				}});
				base.listenTo('playingVideo', { context: this, asArray: false, then(video) {
						actions.updatePlayingVideo(video);
				}});
		}

		componentWillUnmount(){
				window.removeEventListener("beforeunload", this.onUnload);
		}

		onSeekMouseUp(e) {
				const played = parseFloat(e.target.value);
				this.props.actions.seekUp(played);
				this.player.seekTo(played);
		};

  onUnload(e) {
    const { currentUser } = this.props.app;
    if (currentUser.isAnonymous) {
      this.props.actions.removeUser(currentUser.uid);
      firebaseAuth.signOut();
    };
    const u = Object.assign(currentUser, { isHere: false });
    this.props.actions.postUser(u.uid, u);
  };

  getPlaylist(user) {
    fetch(`${YoutubeApiUrl}/channels?${channelsParams(user)}`)
      .then((response) => { return response.json(); })
      .then((json) => {
        const base = json.items[0].contentDetails.relatedPlaylists;
        const lists = Object.keys(base)
                            .map((k) => ({ id: base[k], title: k, thumbnailUrl: ''}))
        this.props.actions.setPlaylists(lists)
      })
      .catch((error) => console.log(error));
  }

  notification(title, option) {
    const notification = new Notification(
      `${title} (${this.props.app.que.length + 1} remained)`,
      { body: option.body, icon: option.icon, silent: true }
    );
    return notification;
  }

  render() {
    const { app, searchResult, actions } = this.props;
				const isPostPlayingVideo = app.playingVideo !== '';
				const playingVideo = app.playingVideo || DefaultVideo;
				const nextVideo = searchResult.que[0];

    return (
      <div className="contents">
        <Header app={app} actions={actions} />
        <Player app={app} nextVideo={nextVideo} actions={actions}>
          <Comments currentUser={app.currentUser} />
          <SearchResult
            currentUser={app.currentUser}
            searchedText={app.searchedText}
            isSearchActive={app.isSearchActive}
            isQueListActive={app.isQueListActive}
            searchResult={app.searchResult}
            isNoPlayingVideo={app.playingVideo.title === ''}
          />
        </Player>
								<div className="footer-bar">
										<div className="play-controll">
												<button
														className={classNames(
																{ 'play-controll__pause': app.playing },
																{ 'play-controll__play': !app.playing },
														)}
														onClick={() => actions.playPause(app.playing, app.duration)}
												>
														&nbsp;
												</button>
												<button
														className="play-controll__skip"
														onClick={() => actions.asyncPostPlayingVideo(nextVideo)}
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
																value={app.played}
																onMouseDown={actions.seekDown}
																onChange={(e) => actions.changePlayed(parseFloat(e.target.value))}
																onMouseUp={this.onSeekMouseUp}
														/>
														<div className="progress-bar__played" style={{ width: `${100 * app.played}%` }}>
														</div>
														<div className="progress-bar__loaded" style={{ width: `${100 * app.loaded}%` }}>
														</div>
												</div>
												<div className="progress-box__status">
														<p>{app.duration * app.played}</p>
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
																value={app.volume}
																onChange={(e) => actions.changeVolume(e.target.value)}
														/>
												</div>
												<p className="volume-box__ttl" onClick={() => actions.changeVolume(0)}>mute</p>
										</div>
								</div>
      </div>
    );
  }
}

App.propTypes = {
  app: React.PropTypes.object,
		searchResult: React.PropTypes.object,
  actions: React.PropTypes.object,
};

const mapStateToProps = ({ app, searchResult }) => ({ app, searchResult });

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(AppActions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
