import React from 'react';
import { post, remove, push } from '../../../scripts/db.js';
import { CommentType, commentObj } from '../../room/utils/constants.js';
import classNames from 'classnames';
import YouTubeNode from 'youtube-node';
import { YOUTUBE_API_KEY } from '../../../config/apiKey';

const videoObject = (video, user) => Object.assign(video, { user });

class SearchResult extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSearchActive: false,
      isPlaylistActive: false,
      searchResult: [],
      searchText: '',
      searchedText: '',
    };
    this.onClickSearch = this.onClickSearch.bind(this);
    this.goTargetVideo = this.goTargetVideo.bind(this);
    this.onClickSetQue = this.onClickSetQue.bind(this);
    this.onChangeText = this.onChangeText.bind(this);
  }

  roomPath() {
    return `rooms/${this.props.roomId}`;
  }

  path(path) {
    return `${this.roomPath()}/${path}`;
  }

  goTargetVideo(video) {
    post(this.path('playingVideo'), video);
    post(this.path('startTime'), 0);
    remove(this.path(`que/${video.key}`));
    push(this.path('comments'), commentObj(`# ${video.title}`, video.user, CommentType.log, ''));
  }

  onChangeText(text) {
    this.setState({ searchText: text })
  }

  onClickSetQue(video) {
    console.log(this.path('que'));
    const { currentUser, isNoPlayingVideo } = this.props;
    const targetVideo = videoObject(video, currentUser);
    if (this.props.que.length === 0 && isNoPlayingVideo ) {
      this.goTargetVideo(targetVideo);
    } else {
      push(this.path('que'), targetVideo);
    }
  }

  onClickSearch() {
    const youTubeNode = new YouTubeNode();
    youTubeNode.setKey(YOUTUBE_API_KEY);
    youTubeNode.addParam('type', 'video');
    youTubeNode.search(this.state.searchText, 50,
      (error, result) => {
        if (error) {
        } else {
          const searchResult = result.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            thumbnailUrl: item.snippet.thumbnails.default.url,
            type: 'video',
          }));
          this.setState({ searchResult, searchedText: this.state.searchText });
        }
      }
    );
  }

  renderSearchResultNode() {
    return this.state.searchResult.map((result, i) => (
      <li key={i} className="list-group-item" onClick={() => this.onClickSetQue(result)}>
        <div className="list-group-item__click">
          <img className="list-group-item__thumbnail" src={result.thumbnailUrl} alt=""/>
          <div className="list-group-item__body">
            <strong>{result.title}</strong>
          </div>
        </div>
      </li>
    ));
  }

  render() {
    return(
      <div>
        <div className="mobile-search-wrap">
          <input
            className={classNames('form-search', { 'is-search-active': this.state.isSearchActive })}
            type="text"
            placeholder="Search"
            onChange={(e) => this.onChangeText(e.target.value)}
            onFocus={() => {
              this.setState({ isSearchActive: true, isPlaylistActive: false });
            }}
            value={this.state.searchText}
          >
          </input>
          <div
            className={classNames(
              'mobile-search-button',
              { 'is-active': this.state.isSearchActive }
            )}
            onClick={this.onClickSearch}
          >
            <img src="/images/icon_search.svg" alt=""/>
          </div>
        </div>
        <div
          className={classNames(
            'display-control',
            { 'is-search-active': this.state.isSearchActive },
          )}
        >
          <div className="display-search">
            <div className="list-group-title">
              search for
              <span className="list-group-title__number">{this.props.searchedText}</span>
            </div>
            <ul className="list-group">
              {this.renderSearchResultNode()}
            </ul>
          </div>
        </div>
      </div>
    )
  }
}

SearchResult.propTypes = {
  roomId: React.PropTypes.string,
  que: React.PropTypes.array,
  currentUser: React.PropTypes.object,
  isNoPlayingVideo: React.PropTypes.bool,
};

export default SearchResult;
