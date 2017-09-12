import React from 'react';
import { push, post } from '../scripts/db';
import { base } from '../config/firebaseApp.js';
import Room from '../classes/room.js';
import ReactPlayer from 'react-player';

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
         <a href="#" onClick={this.onClickToggleButtonArea}>Enter a existing room</a>
       </div>
     )
   }
   return (
     <div className="create-room-box">
       <p>Enter a room</p>
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
         Enter a room
       </button>
       <a href="#" onClick={this.onClickToggleButtonArea}>Create a new room</a>
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
      <ReactPlayer
        ref={(player) => { this.player = player; }}
        className="react-player top-bg-movie"
        width={"110%"}
        height={"110%"}
        url={'https://www.youtube.com/watch?v=qNMTGTJ0ovA'}
        playing={true}
        volume={0}
        onReady={() => console.log('Ready')}
        onPlay={() => console.log('Play')}
        onPause={() => console.log('Pause')}
        onEnded={() => console.log('Pause')}
        onError={() => console.log('Pause')}
        onProgress={() => console.log('Pause')}
      />
    </div>
  )
 }
}

Top.contextTypes = { router: React.PropTypes.object };
export default Top;
