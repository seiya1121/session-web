import React from 'react';
import ReactDOM from 'react-dom';
import {
 BrowserRouter as Router,
 Route,
} from 'react-router-dom'

// Component
import Rooms from './components/rooms.jsx';
import Top from './components/top.jsx';
import Mobile from './components/mobile/rooms.jsx';

class Root extends React.Component {
 render() {
  return (
    <Router>
      <div className="contents">
        <Route exact path="/" component={Top} />
        <Route path="/mobile/:roomName" component={Mobile} />
        {
          //<Route path="/:roomName" component={Rooms} />
        }
      </div>
    </Router>
  )
 }
}

ReactDOM.render(
  <Root />,
  document.getElementById('root')
);
