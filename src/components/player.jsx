import React from 'react';
import ReactBaseComponent from './reactBaseComponent';
import ReactPlayer from 'react-player';

import { DefaultVideo } from '../action_types/app';
import classNames from 'classnames';

// Redux系
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
import * as Actions from '../actions/app';

const youtubeUrl = (id) => `https://www.youtube.com/watch?v=${id}`;

class Player extends ReactBaseComponent {
		render(){
				const { state, nextVideo, actions } = this.props;
				const playingVideo = state.playingVideo || DefaultVideo;
				const isPostPlayingVideo = app.playingVideo !== '';
				const playingVideo = app.playingVideo || DefaultVideo;

				return (
						<div>
								<div className="main-display">
										<div className="display-youtube">
												<ReactPlayer
														ref={(player) => { this.player = player; }}
														className="react-player"
														width={"100%"}
														height={"100%"}
														url={youtubeUrl(playingVideo.id)}
														playing={state.playing}
														volume={state.volume}
														soundcloudConfig={state.soundcloudConfig}
														vimeoConfig={state.vimeoConfig}
														youtubeConfig={state.youtubeConfig}
														fileConfig={state.fileConfig}
														onReady={() => actions.play()}
														onPlay={() => actions.play()}
														onPause={() => actions.pause(state.played, state.duration)}
														onEnded={() => actions.asyncPostPlayingVideo(nextVideo)}
														onError={() => actions.asyncPostPlayingVideo(nextVideo)}
														onProgress={actions.progress}
														onDuration={(duration) => actions.changeValueWithKey('duration', duration)}
												/>
										</div>
										{this.props.children}
								</div>
								<div className="footer-bar">
										<div className="play-controll">
												<button
														className={classNames(
																{ 'play-controll__pause': state.playing },
																{ 'play-controll__play': !state.playing },
														)}
														onClick={() => actions.playPause(state.playing, state.duration)}
												>
												&nbsp;
												</button>
												<button
														className="play-controll__skip"
														onClick={() => actions.asyncPostPlayingVideo(nextVideo)}
												>&nbsp;
												</button>
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
																value={state.played}
																onMouseDown={actions.seekDown}
																onChange={(e) => actions.changePlayed(parseFloat(e.target.value))}
																onMouseUp={this.onSeekMouseUp}
														/>
														<div className="progress-bar__played" style={{ width: `${100 * state.played}%` }}>
														</div>
														<div className="progress-bar__loaded" style={{ width: `${100 * state.loaded}%` }}>
														</div>
												</div>
												<div className="progress-box__status">
														<p>{state.duration * state.played}</p>
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
																value={state.volume}
																onChange={(e) => actions.changeVolume(e.target.value)}
														/>
												</div>
												<p className="volume-box__ttl" onClick={() => actions.changeVolume(0)}>mute</p>
										</div>
								</div>
						</div>
				);
		};
}

Player.propTypes = {
		state: React.PropTypes.object,
		actions: React.PropTypes.object,
};

const mapStateToProps = (state) => ({ state: state.app });

const mapDispatchToProps = (dispatch) => ({
		actions: bindActionCreators(Actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Player);
