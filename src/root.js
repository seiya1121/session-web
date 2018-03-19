import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';
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
        ? <BrowserRouter>
            <div className="contents">
              <Route exact path="/" component={Top} />
              <Route path="/:roomName" component={Mobile} />
            </div>
          </BrowserRouter>
        : <BrowserRouter>
            <div className="contents">
              <Route exact path="/" component={Top} />
              <Route path="/:roomName" component={Rooms} />
            </div>
          </BrowserRouter>
      }
   </Media>
  )
 }
}

ReactDOM.render(
  <Root />,
  document.getElementById('root')
);
