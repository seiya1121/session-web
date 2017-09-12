import React from 'react';
import ReactDOM from 'react-dom';
import {
 BrowserRouter as Router,
 Route,
} from 'react-router-dom';
import Media from 'react-media';

// Component
import Rooms from './components/rooms.jsx';
import Top from './components/top.jsx';
import Mobile from './components/mobile/rooms.jsx';

class Root extends React.Component {
 render() {
  return (
    <Media query={{ maxWidth: 768 }}>
      {matches => matches
        ? <Router>
            <div className="contents">
              <Route exact path="/" component={Top} />
              <Route path="/:roomName" component={Mobile} />
            </div>
          </Router>
        : <Router>
            <div className="contents">
              <Route exact path="/" component={Top} />
              <Route path="/:roomName" component={Rooms} />
            </div>
          </Router>
      }
   </Media>
  )
 }
}

ReactDOM.render(
  <Root />,
  document.getElementById('root')
);
