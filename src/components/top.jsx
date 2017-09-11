import React from 'react';
import { push } from '../scripts/db';
import { base } from '../config/firebaseApp.js';

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
     .then(data => this.setState({ roomNames: data.map(({name}) => name) }))
 }

 onClickSubmitRoom() {
   if (this.state.roomName === '') return false;
   if (this.state.roomNames.includes(this.state.roomName)) return false;
   push('rooms', { name: this.state.roomName })
     .then(res => res.key)
     .then(key => {
       this.props.history.push({ pathname: `/${this.state.roomName}`, state: {
         name: this.state.roomName, key } });
		 })
     .catch(err => console.log(err));
   return true
 }

 render() {
  return (
    <div>
     <h1>SESSION</h1>
     <input
       type="text"
       placeholder="type room name"
       onChange={(e) => this.setState({ roomName: e.target.value })}
       value={this.state.roomName}
     >
     </input>
     <button onClick={this.onClickSubmitRoom}>
        Create new room
     </button>
    </div>
  )
 }
}

Top.contextTypes = { router: React.PropTypes.object };
export default Top;