import React from 'react';
import classNames from 'classnames';
import { push } from '../../scripts/db.js';
import { base } from '../../config/firebaseApp';
import { DefaultVideoWave } from '../../constants.js';

class Wave extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      videoWave: {
        videoId: props.playingVideo.id
      }
    }
    this.doWave = this.doWave.bind(this);
  }

  doWave(e) {
    e.preventDefault;
    push(this.path('videoWaves'), this.state.videoWave);
  }

  roomPath() {
    return `rooms/${this.props.roomKey}`;
  }

  path(path) {
    return `${this.roomPath()}/${path}`;
  }

  render() {
    return(
      <div>
        <button
          onClick={(e) => this.doWave(e) }
          style={{ background: 'white' }}
        >
          wave
        </button>
      </div>
    )
  }
}

Wave.propTypes = {
  playingVideo: React.PropTypes.object
};

export default Wave;
