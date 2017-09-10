import React from 'react';
import ReactDOM from 'react-dom';
import {
 BrowserRouter as Router,
 Route,
} from 'react-router-dom'

// Component
import Room from './components/room.jsx';
import Top from './components/top.jsx';

class Root extends React.Component {
 render() {
  return (
    <Router>
      <div>
        <Route exact path="/" component={Top} />
        <Route path="/:groupName" component={Room} />
      </div>
    </Router>
  )
 }
}

ReactDOM.render(
  <Root />,
  document.getElementById('root')
);
