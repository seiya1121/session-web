import React from 'react';
import ReactBaseComponent from './reactBaseComponent';
import ReactPlayer from 'react-player';

import { DefaultVideo } from '../action_types/app';

// Redux系
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
import * as Actions from '../actions/app';

const youtubeUrl = (id) => `https://www.youtube.com/watch?v=${id}`;

class Player extends ReactBaseComponent {
		render(){
				const { state, nextVideo, actions } = this.props;
				const playingVideo = state.playingVideo || DefaultVideo;

				return (
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
