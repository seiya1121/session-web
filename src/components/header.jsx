import React from 'react';
import ReactBaseComponent from './reactBaseComponent';
import classNames from 'classnames';
import { YOUTUBE_API_KEY } from '../config/apiKey';
import YouTubeNode from 'youtube-node';
import { firebaseAuth, provider } from '../config/firebaseApp';

class Header extends ReactBaseComponent {
  constructor(props) {
    super(props);
    this.bind('onKeyPressForSearch', 'onClickSignOut', 'onClickSignIn');
  }

  onClickSignIn() {
    const { uid, isAnonymous } = this.props.app.currentUser;
    if(isAnonymous){
      this.props.actions.removeUser(uid);
    }
    provider.addScope('https://www.googleapis.com/auth/youtube');
    firebaseAuth.signInWithRedirect(provider)
  }

  onClickSignOut() {
    const { uid } = this.props.app.currentUser;
    this.props.actions.removeUser(uid);
    firebaseAuth.signOut().then(() => {
      firebaseAuth.signInAnonymously();
    });
  }

  onKeyPressForSearch(e) {
    if (e.which !== 13) return false;
    e.preventDefault();
    const searchFunc = (error, result) => {
      if (error) {
        console.log(error);
      } else {
        this.props.actions.setSearchResult('search', result.items);
      }
    };
    this.props.actions.changeValueWithKey('searchedText', this.props.app.searchText);
    const youTubeNode = new YouTubeNode();
    youTubeNode.setKey(YOUTUBE_API_KEY);
    youTubeNode.addParam('type', 'video');
    youTubeNode.search(this.props.app.searchText, 50, (error, result) => searchFunc(error, result));
    return true;
  }

  render(){
    const { app, actions } = this.props;
    const { displayName, photoURL, isAnonymous } = app.currentUser;
    const isLogin = !isAnonymous;
    // const users = app.users.filter((u) => (app.currentUser.uid !== u.uid && u.isHere));
    // const usersNode = users.map((u, i) => (
    //   <img className="login-users__icons" key={i} src={u.photoURL} alt={u.displayName} />
    // ));
    const authrizeButton = (isLogin) => (
      (isLogin) ?
        <a className="header-bar-prof__sign" onClick={this.onClickSignOut}>Sign Out</a> :
        <a className="header-bar-prof__sign" onClick={this.onClickSignIn}>Sign In</a>
    );
    // const playlistButton = (
    //   <div
    //     className={
    //       classNames('button-playlist-list', { 'is-playlist-list': app.isPlaylistActive })
    //     }
    //     onClick={() => {
    //       actions.changeValueWithKey('isPlaylistActive', !app.isPlaylistActive);
    //       actions.changeValueWithKey('isSearchActive', !app.isPlaylistActive);
    //       actions.setSearchResult('playlist', app.playlists);
    //     }}
    //   >
    //     <span />
    //   </div>
    // );

    return(
      <header className="header-bar">
        <div className="header-bar__left">
          <div className="header-bar-prof">
            <img className="header-bar-prof__icon" src={photoURL} alt="" />
            <p className="header-bar-prof__name">{displayName}{authrizeButton(isLogin)}</p>
          </div>
          {/*<div className="login-users">{usersNode}</div>*/}
        </div>
        <div
          className={classNames('button-search-list', { 'is-search-active': app.isSearchActive })}
          onClick={() => actions.changeValueWithKey('isSearchActive', !app.isSearchActive)}
        >
          <span />
          <span />
          <span />
        </div>
        <input
          className={classNames('form-search', { 'is-search-active': app.isSearchActive })}
          type="text"
          placeholder="Search"
          onChange={(e) => { actions.changeValueWithKey('searchText', e.target.value); }}
          onFocus={() => {
            actions.changeValueWithKey('isSearchActive', true);
            actions.changeValueWithKey('searchResult', []);
            actions.changeValueWithKey('isPlaylistActive', false);
          }}
          onKeyPress={this.onKeyPressForSearch}
          value={app.searchText}
        >
        </input>
        {/*{app.currentUser.accessToken !== '' && playlistButton}*/}
        <div
          className={classNames('button-que-list', { 'is-quelist-list': app.isQueListActive })}
          onClick={() => actions.changeValueWithKey('isQueListActive', !app.isQueListActive)}
        >
          <span />
          <span />
          <span />
        </div>
      </header>
    )
  }
}

Header.propTypes = {
  app: React.PropTypes.object,
  actions: React.PropTypes.object,
};

export default Header;
