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
    isShowCreateRoomButton: true,
  };

  this.onClickSubmitRoom = this.onClickSubmitRoom.bind(this);
  this.onClickRedirectRoom = this.onClickRedirectRoom.bind(this);
  this.onClickToggleButtonArea = this.onClickToggleButtonArea.bind(this);
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

 onClickRedirectRoom() {
   const { roomName } = this.state;
   if (roomName === '') return false;
   if (!this.state.roomNames.includes(roomName)) return false;
   this.props.history.push({ pathname: `/${roomName}`})
 }

 onClickToggleButtonArea() {
   this.setState({ isShowCreateRoomButton: !this.state.isShowCreateRoomButton })
 }

 renderButtonArea() {
   if (this.state.isShowCreateRoomButton) {
     return (
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
         <p className="top-or">OR<a href="#" onClick={this.onClickToggleButtonArea} className="toggle-url-form">Enter existing room</a> </p>
       </div>
     )
   }
   return (
     <div className="create-room-box">
       <p>Enter room</p>
       <span>session/</span>
       <input
         type="text"
         placeholder="type-room-name"
         onChange={(e) => this.setState({ roomName: e.target.value })}
         value={this.state.roomName}
         className="create-room-input"
       >
       </input>
       <button onClick={this.onClickRedirectRoom} className="create-room-btn">
         Enter room
       </button>
       <p className="top-or">OR<a href="#" onClick={this.onClickToggleButtonArea} className="toggle-url-form">Create a new room</a></p>
     </div>
   )
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
        {this.renderButtonArea()}
      </div>
      <img src="/images/temporary-top-image.jpg" alt="PlaceHolder" className="top-bg-img" />
    </div>
  )
 }
}

Top.contextTypes = { router: React.PropTypes.object };
export default Top;
