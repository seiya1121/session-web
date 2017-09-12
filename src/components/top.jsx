import React from 'react';
import { push, post } from '../scripts/db';
import { base } from '../config/firebaseApp.js';
import Room from '../classes/room.js';

// Styles
import '../styles/base.scss';
import '../styles/normalize.scss';
import '../styles/top.scss';

class Top extends React.Component {
 constructor(props) {
  super(props);
  this.state = {
    roomNames: [],
    roomName: '',
  };

  this.onClickSubmitRoom = this.onClickSubmitRoom.bind(this);
 }

 componentWillMount() {
	 base.fetch('rooms', { context: this, asArray: true})
     .then(data => this.setState({ roomNames: data.map(({ name }) => name) }))
 }

 onClickSubmitRoom() {
   const { roomName } = this.state;
   if (roomName === '') return false;
   if (this.state.roomNames.includes(roomName)) return false;
   push('rooms', { name: roomName })
     .then(res => {
       const room  = new Room(res.key, roomName);
       post(`rooms/${res.key}`, room)
     })
     .then(this.props.history.push({ pathname: `/${roomName}`}))
     .catch(err => console.log(err));
   return true
 }

 render() {
  return (
    <div className="img-wrap">
      <div className="top-content-box">
        <img src="/images/session-logo.png" alt="SESSION" className="session-logo" />
        <div className="copy-box">
          <p className="first-copy">Why not chill out and share your taste with your fellows?</p>
          <p className="second-copy">Enjoy your "SESSION" anytime, anywhere.</p>
        </div>
        <div className="create-room-box">
          <p>Create a room link</p>
          <span>session/</span>
          <input
            type="text"
            placeholder="type-room-name"
            onChange={(e) => this.setState({ roomName: e.target.value })}
            value={this.state.roomName}
            className="create-room-input"
          >
          </input>
          <button onClick={this.onClickSubmitRoom} className="create-room-btn">
             Create new room
          </button>
        </div>
      </div>
      <img src="/images/temporary-top-image.jpg" alt="PlaceHolder" className="top-bg-img" />
    </div>
  )
 }
}

Top.contextTypes = { router: React.PropTypes.object };
export default Top;
