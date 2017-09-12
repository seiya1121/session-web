import React from 'react';
import classNames from 'classnames';
import { push } from '../../scripts/db.js';
import { base } from '../../config/firebaseApp';
import {VelocityComponent, VelocityTransitionGroup} from 'velocity-react';

class Wave extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: this.props.id,
      wave: this.props.wave
    };
    this.doWave = this.doWave.bind(this);
  }

	componentDidMount() {
    base.listenTo('comments', { context: this, asArray: true, then(comments) {
      this.setState({ comments });
    }});
  }

  doWave(num) {
    return (
      <VelocityTransitionGroup enter={{animation: "slideDown"}} leave={{animation: "slideUp"}} runOnMount={true}>
        <h1 style={{marginRight: 'auto', marginLeft: 'auto', textAlign: 'center', position: 'relative'}}>
          Modal test
        </h1>
      </VelocityTransitionGroup>
    )
  }

  render() {
    return(
      <div>
        <button
          onClick={() => this.doWave()}>
          wave
        </button>
        { this.doWave() }
      </div>
    )
  }
}

Wave.propTypes = {
  id: React.PropTypes.integer,
  wave: React.PropTypes.integer,
};

export default Wave;
