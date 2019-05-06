import React from 'react';
import { push, post, remove } from '../scripts/db';
import { provider, firebaseAuth } from '../config/firebaseApp.js';
import Room from '../classes/room.js';

// Styles
import '../styles/base.scss';
import '../styles/normalize.scss';
import '../styles/top.scss';

class Top extends React.Component {
 constructor(props) {
  super(props);
  this.state = {
    uid: '',
    accessToken: '',
    displayName: '',
    photoURL: '',
    rooms: [],
    roomNames: [],
    roomName: '',
    isShowCreateRoomButton: true,
  };

  this.onClickSubmitRoomForScala = this.onClickSubmitRoomForScala.bind(this);
  this.onClickDeleteRoom = this.onClickDeleteRoom.bind(this);
  this.onClickSignIn = this.onClickSignIn.bind(this);
  this.onClickSignOut = this.onClickSignOut.bind(this);
  this.onClickRedirectRoom = this.onClickRedirectRoom.bind(this);
  this.onClickToggleButtonArea = this.onClickToggleButtonArea.bind(this);
 }

 componentWillMount() {
   firebaseAuth.onAuthStateChanged(user => {
     if (user) {
       const accessToken = user.getToken();
       const { uid, photoURL , displayName } = user;
       this.setState({ uid, accessToken, photoURL, displayName }, () => {
         window.fetch('http://localhost:9000/rooms')
                .then(res => res.json()).then(rooms => this.setState({ rooms }));
       });
     }
   })
 }

  onClickDeleteRoom(id) {
    window.fetch(
      `http://localhost:9000/users/${this.state.uid}rooms/${id}`,
      { method: 'DELETE' }
    ).then(() => this.setState({ rooms: this.state.rooms.filter(r => r.id !== id) }));
    return true
  }

  onClickSubmitRoomForScala() {
    const { roomName } = this.state;
    if (roomName === '') return false;
    if (this.state.roomNames.includes(roomName)) return false;
    window.fetch(
      'http://localhost:9000/rooms',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: roomName,
          uid: this.state.uid,
        }),
      }
    ).then(res => res.json())
    .then(room => {
      push('rooms', { name: room.name })
      .then(res => {
        const roomObj  = new Room(res.key, room.name);
        post(`rooms/${res.key}`, roomObj)
      })
       .then(this.props.history.push({ pathname: `/${room.name}`}))
    });
    return true
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

 onClickSignIn() {
   firebaseAuth.signInWithPopup(provider).then((result) => {
     const accessToken = result.user.getToken();
     const { uid, photoURL , displayName } = result.user;
     this.setState({ uid, accessToken, photoURL, displayName }, () => {
       window.fetch('http://localhost:9000/rooms')
              .then(res => res.json())
              .then(rooms => this.setState({ rooms }));
     });
   }).catch(function(error) {
     console.log(error.code);
   });
 }

 onClickSignOut() {
   firebaseAuth.signOut().then(() => {
     this.setState({ uid: '', accessToken: '' });
   }).catch(function(error) {
     // An error happened.
   });
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

 renderCreateRoomForm() {
   return (
     <div className="create-room-box">
       <p>Create a room for Scala</p>
       <span>session/</span>
       <input
         type="text"
         placeholder="type-room-name"
         onChange={(e) => this.setState({ roomName: e.target.value })}
         value={this.state.roomName}
         className="create-room-input"
       >
       </input>
       <button onClick={this.onClickSubmitRoomForScala} className="create-room-btn">
         Create new room
       </button>
     </div>
   )
 }

 renderRooms() {
   return this.state.rooms.filter(r => r.uid === this.state.uid).map(r => (
     <p key={r.id}>
       <a href={`/${r.name}`}>{r.name}</a>
       <button onClick={() => this.onClickDeleteRoom(r.id)}>
         Delete
       </button>
     </p>
   ))
 }

 render() {
  return (
    <div className="img-wrap">
      <div className="top-content-box">
        <img src="/images/session-logo.png" alt="SESSION" className="session-logo" />
        {
          (this.state.uid === '') ? (
            <dib>
              <div className="copy-box">
                <p className="first-copy">Why not chill out and share your taste with your fellows?</p>
                <p className="second-copy">Enjoy your "SESSION" anytime, anywhere.</p>
              </div>
              <button onClick={this.onClickSignIn} className="create-room-btn">
                log in
              </button>
            </dib>
          ) : (
            <div>
              <button onClick={this.onClickSignOut} className="create-room-btn">
                log out
              </button>
              <p>name: {this.state.displayName}</p>
              <img src={this.state.photoURL} alt={this.state.displayName}  width="10%" height="10%" /><br/>
              {this.renderCreateRoomForm()}
              {this.renderRooms()}
            </div>
          )
        }
        {/*{this.renderButtonArea()}*/}
      </div>
      <img src="/images/temporary-top-image.jpg" alt="PlaceHolder" className="top-bg-img" />
    </div>
  )
 }
}

Top.contextTypes = { router: React.PropTypes.object };
export default Top;
