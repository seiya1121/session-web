import React from 'react';
import ReactBaseComponent from './reactBaseComponent';
import classNames from 'classnames';
import { YoutubeApiUrl } from '../action_types/app';
import 'whatwg-fetch';
import { SortableContainer, SortableElement, arrayMove, SortableHandle } from 'react-sortable-hoc';

// Redux系
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
import * as Actions from '../actions/searchResult';
import { base } from '../config/firebaseApp';

const playlistItemsParams = (accessToken, playlistId) => (
  `access_token=${accessToken}&part=snippet&playlistId=${playlistId}&maxResults=50`
);

const videoObject = (video, user) => Object.assign(video, { user });

class SearchResult extends ReactBaseComponent {
  constructor(props) {
    super(props);
    this.bind('getPlaylistVideos', 'onClickSetQue', 'onSortEnd');
  }

  componentWillMount() {
				const { actions } = this.props;
				base.fetch('que', { context: this, asArray: true, then(que) {
						actions.updateQue(que);
				}});
  }

		componentDidMount() {
				const { actions } = this.props;
				base.listenTo('que', { context: this, asArray: true, then(que) {
						actions.updateQue(que);
				}});
		}

		onSortEnd({oldIndex, newIndex}) {
    const { que } = this.props.state;
				this.props.actions.asyncUpdateQue(arrayMove(que, oldIndex, newIndex));
		};

  onClickSetQue(video) {
    const { currentUser, isNoPlayingVideo } = this.props;
    const { que } = this.props.state;
    const targetVideo = videoObject(video, currentUser);
    if (que.length === 0 && isNoPlayingVideo ) {
      this.props.actions.asyncPostPlayingVideo(targetVideo);
    } else {
      this.props.actions.asyncPushVideo(targetVideo);
    }
  }

  getPlaylistVideos(playlistId) {
    const { accessToken } = this.props.currentUser;
    fetch(`${YoutubeApiUrl}/playlistItems?${playlistItemsParams(accessToken, playlistId)}`)
      .then((response) => response.json())
      .then((result) => this.props.actions.setSearchResult('playlistVideo', result))
  }

  render(){
    const { state, actions, isPlaylistActive, playlists } = this.props;
				const DragHandle = SortableHandle(() => <span>::</span>);
    const VideoList = SortableElement(({ video }) =>
      <li key={video.key} className="list-group-item">
        <DragHandle />
        <div
          className="list-group-item__click"
          onClick={() => actions.asyncPostPlayingVideo(video)}
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
        <div className="list-group-item__close" onClick={() => actions.asyncRemoveVideo(video.key)}>
        </div>
      </li>
    );

    const SortableQueList = SortableContainer(({que}) => {
						return (
        <ul>
          {que.map((video, i) =>
            <VideoList key={i} index={i} video={video} />
          )}
        </ul>
						);
				})

    const searchCategory = () => {
      if(!isPlaylistActive) {
        return (
          <div className="list-group-title">
            search for
            <span className="list-group-title__number">{this.props.searchedText}</span>
          </div>
        )
      }
      if(isPlaylistActive && state.selectedPlaylist) {
        return (
          <div>
            <li
              className="list-group-item"
              onClick={() => {
                actions.setSearchResult('playlist', playlists);
                actions.setSearchResult('selectedPlaylist', '')
              }}
            >
              <div className="list-group-item__click">
                <div className="list-group-item__body">
                  Back
                </div>
              </div>
            </li>
            <div className="list-group-title"><strong>{state.selectedPlaylist}</strong></div>
          </div>
        )
      }
       return ( <div className="list-group-title">Playlists</div> );
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
          actions.changeValueWithKey('selectedPlaylist', result.title);
        }}>
        <div className="list-group-item__click">
          <div className="list-group-item__body">
            <strong>{result.title}</strong>
          </div>
        </div>
      </li>
    );

    const searchResultNode = this.props.searchResult.map((result, i) => (
      (result.type === 'video') ? videoResult(result, i) : listResult(result, i)
    ));

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
            Up Coming <span className="list-group-title__number">{state.que.length}</span>
          </div>
          <ul className="list-group">
            <SortableQueList que={state.que} onSortEnd={this.onSortEnd} useDragHandle={true} />
          </ul>
        </div>
        <div className="display-search">
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
  state: React.PropTypes.object,
  actions: React.PropTypes.object,
};

const mapStateToProps = (state) => ({ state: state.searchResult });

const mapDispatchToProps = (dispatch) => ({
		actions: bindActionCreators(Actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchResult);
