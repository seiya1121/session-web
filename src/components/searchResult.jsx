import React from 'react';
import ReactBaseComponent from './reactBaseComponent';
import classNames from 'classnames';
import { YoutubeApiUrl } from '../constants/app';
import 'whatwg-fetch';

const playlistItemsParams = (accessToken, playlistId) => (
  `access_token=${accessToken}&part=snippet&playlistId=${playlistId}&maxResults=50`
);

const videoObject = (video, user) => Object.assign(video, { user });

class SearchResult extends ReactBaseComponent {
  constructor(props) {
    super(props);
    this.bind('getPlaylistVideos', 'onClickSetQue');
  }

  onClickSetQue(video) {
    const { que, currentUser, playingVideo } = this.props.app;
    const targetVideo = videoObject(video, currentUser);
    if (que.length === 0 && playingVideo.title === '') {
      this.props.appActions.postPlayingVideo(targetVideo);
    } else {
      this.props.appActions.pushVideo(targetVideo);
    }
  }

  getPlaylistVideos(playlistId) {
    const { accessToken } = this.props.app.currentUser;
    fetch(`${YoutubeApiUrl}/playlistItems?${playlistItemsParams(accessToken, playlistId)}`)
      .then((response) => response.json())
      .then((result) => this.props.appActions.setSearchResult('playlistVideo', result))
  }

  render(){
    const { app, appActions } = this.props;
    const que = app.que.filter((item) => item.key !== app.que[0].key)
    const searchCategory = () => {
      if(!app.isPlaylistActive) {
        return (
          <p className="list-group-title">
            search for
            <span className="list-group-title__number">{app.searchedText}</span>
          </p>
        )
      }
      if(app.isPlaylistActive && app.selectedPlaylist) {
        return (
          <div>
            <li
              className="list-group-item"
              onClick={() => {
                appActions.setSearchResult('playlist', app.playlists);
                appActions.setSearchResult('selectedPlaylist', '')
              }}
            >
              <div className="list-group-item__click">
                <div className="list-group-item__body">
                  Back
                </div>
              </div>
            </li>
            <p className="list-group-title"><strong>{app.selectedPlaylist}</strong></p>
          </div>
        )
      }
       return ( <p className="list-group-title">Playlists</p> );
    };

    const videoResult = (result, i) => (
      <li key={i} className="list-group-item" onClick={() => this.onClickSetQue(result)}>
        <div className="list-group-item__click">
          <img className="list-group-item__thumbnail" src={result.thumbnailUrl} alt=""/>
          <div className="list-group-item__body">
            <strong>{result.title}</strong>
          </div>
        </div>
      </li>
    );

    const listResult = (result, i) => (
      <li
        key={i}
        className="list-group-item"
        onClick={() => {
          this.getPlaylistVideos(result.id);
          appActions.changeValueWithKey('selectedPlaylist', result.title);
        }}>
        <div className="list-group-item__click">
          <div className="list-group-item__body">
            <strong>{result.title}</strong>
          </div>
        </div>
      </li>
    );

    const searchResultNode = app.searchResult.map((result, i) => (
      (result.type === 'video') ? videoResult(result, i) : listResult(result, i)
    ));

    const queNode = que.map((video) => (
      <li key={video.key} className="list-group-item">
        <div
          className="list-group-item__click"
          onClick={() => appActions.postPlayingVideo(video)}
        >
          <img
            className="list-group-item__thumbnail"
            src={video.thumbnailUrl}
            alt=""
          />
          <div className="list-group-item__body">
            <strong>{video.title}</strong>
            <p className="list-group-item__name">added by {video.user.displayName}</p>
          </div>
        </div>
        <div className="list-group-item__close" onClick={() => appActions.removeVideo(video)}>
        </div>
      </li>
    ));

    return (
      <div
        className={classNames(
          'display-control',
          { 'is-search-active': app.isSearchActive },
          { 'is-quelist-list': app.isQueListActive },
        )}
      >
        {/* Play list */}
        <div className="display-list">
          <p className="list-group-title">
            Up Coming <span className="list-group-title__number">{que.length}</span>
          </p>
          <ul className="list-group">
            {queNode}
          </ul>
        </div>
        <div className="display-search">
          <div
            className="display-search__close"
            onClick={() => {
              appActions.changeValueWithKey('isSearchActive', false);
              appActions.changeValueWithKey('isPlaylistActive', false);
            }}
          />
          {searchCategory()}
          <ul className="list-group">
            {searchResultNode}
          </ul>
        </div>
      </div>
    )
  }
}

SearchResult.propTypes = {
  app: React.PropTypes.object,
  appActions: React.PropTypes.object,
};

export default SearchResult;
