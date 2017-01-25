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
    provider.addScope('https://www.googleapis.com/auth/youtube');
    firebaseAuth.signInWithRedirect(provider)
  }

  onClickSignOut() {
    const { uid } = this.props.app.currentUser;
    firebaseAuth.signOut().then(() => {
      this.props.appActions.removeUser(uid);
      this.props.appActions.setDefaultUser();
    });
  }

  onKeyPressForSearch(e) {
    if (e.which !== 13) return false;
    e.preventDefault();
    const searchFunc = (error, result) => {
      if (error) {
        console.log(error);
      } else {
        this.props.appActions.setSearchResult('search', result.items);
      }
    };
    this.props.appActions.changeValueWithKey('searchedText', this.props.app.searchText);
    const youTubeNode = new YouTubeNode();
    youTubeNode.setKey(YOUTUBE_API_KEY);
    youTubeNode.addParam('type', 'video');
    youTubeNode.search(this.props.app.searchText, 50, (error, result) => searchFunc(error, result));
    return true;
  }

  render(){
    const {app, appActions} = this.props;
    const { accessToken, name, photoURL } = app.currentUser;
    const isLogin = accessToken;

    const usersNode = app.users.map((user, i) => (
      <img key={i} src={user.photoURL} alt={user.name} />
    ));

    return(
      <div>
        <div className="header-bar__left">
          <div className="header-bar-prof">
            <img className="header-bar-prof__icon" src={photoURL} alt="" />
            <p className="header-bar-prof__name">
              {name}
              {
                (isLogin) ?
                  <a className="header-bar-prof__sign" onClick={this.onClickSignOut}>Sign Out</a> :
                  <a className="header-bar-prof__sign" onClick={this.onClickSignIn}>Sign In</a>
              }
            </p>
          </div>
          {usersNode}
        </div>
        <input
          className={classNames('form-search', { 'is-search-active': app.isSearchActive })}
          type="text"
          placeholder="Search videos"
          onChange={(e) => { appActions.changeValueWithKey('searchText', e.target.value); }}
          onFocus={() => {
            appActions.changeValueWithKey('isSearchActive', true);
            appActions.changeValueWithKey('searchResult', []);
            appActions.changeValueWithKey('isPlaylistActive', false);
          }}
          onKeyPress={this.onKeyPressForSearch}
          value={app.searchText}
        >
        </input>
        <div
          className={
            classNames('button-playlist-list', { 'is-playlist-list': app.isPlaylistActive })
          }
          onClick={() => {
            appActions.changeValueWithKey('isPlaylistActive', !app.isPlaylistActive);
            appActions.changeValueWithKey('isSearchActive', !app.isPlaylistActive);
            appActions.setSearchResult('playlist', app.playlists);
          }}
        >
          <span />
        </div>
        <div
          className={classNames('button-que-list', { 'is-quelist-list': app.isQueListActive })}
          onClick={() => appActions.changeValueWithKey('isQueListActive', !app.isQueListActive)}
        >
          <span />
          <span />
          <span />
        </div>
      </div>
    )
  }
}

Header.propTypes = {
  app: React.PropTypes.object,
  appActions: React.PropTypes.object,
};

export default Header;
