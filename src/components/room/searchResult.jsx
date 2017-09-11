import React from 'react';
import classNames from 'classnames';
import { post, remove, push } from '../../scripts/db.js';
import { CommentType, commentObj } from './utils/constants.js';

const videoObject = (video, user) => Object.assign(video, { user });

class SearchResult extends React.Component {
  constructor(props) {
    super(props);
    this.goTargetVideo = this.goTargetVideo.bind(this);
    this.onClickSetQue = this.onClickSetQue.bind(this);
  }

	roomPath() {
		return `/rooms/${this.props.roomId}`;
	}

	path(path) {
		return `${this.roomPath()}/${path}/`;
	}

	goTargetVideo(video) {
		post(this.path('playingVideo'), video);
		post(this.path('startTime'), 0);
		remove(this.path(`que/${video.key}`));
		push(this.path('comments'), commentObj(`# ${video.title}`, video.user, CommentType.log, ''));
	}

  onClickSetQue(video) {
    const { currentUser, isNoPlayingVideo } = this.props;
    const targetVideo = videoObject(video, currentUser);
    if (this.props.que.length === 0 && isNoPlayingVideo ) {
      this.goTargetVideo(targetVideo);
    } else {
      push(this.path('que'), targetVideo);
    }
  }

  renderVideoNode() {
    return this.props.que.map((video, i) => (
      <li key={video.key} className="list-group-item">
        <div
          className="list-group-item__click"
          onClick={() => this.goTargetVideo(video)}
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
        <div className="list-group-item__close" onClick={() => remove(this.path(`que/${video.key}`))}>
        </div>
      </li>
    ))
  }

  renderSearchResultNode() {
    return this.props.searchResult.map((result, i) => (
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

  render(){
    return (
      <div
        className={classNames(
          'display-control',
          { 'is-search-active': this.props.isSearchActive },
          { 'is-quelist-list': this.props.isQueListActive },
        )}
      >
        <div className="display-list">
          <div className="list-group-title">
            Up Coming <span className="list-group-title__number">{this.props.que.length}</span>
          </div>
          <ul className="list-group">
            {this.renderVideoNode()}
          </ul>
        </div>
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
    )
  }
}

SearchResult.propTypes = {
  roomId: React.PropTypes.string,
  que: React.PropTypes.array,
  searchResult: React.PropTypes.array,
  isSearchActive: React.PropTypes.bool,
  isQueListActive: React.PropTypes.bool,
  currentUser: React.PropTypes.object,
  searchedText: React.PropTypes.string,
  isNoPlayingVideo: React.PropTypes.bool,
};

export default SearchResult;
