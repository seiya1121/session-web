import React, { Component } from 'react';
import ReactBaseComponent from './reactBaseComponent';

class App extends ReactBaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      playing: true,
      volume: 0.8,
      played: 0,
      loaded: 0,
      duration: 0,
      seeking: false,
      playbackRate: 1.0,
      playingVideo: '',
      searchText: '',
      commentText: '',
      userName: '',
      searchResult: [],
      searchResultNum: '',
      que: [],
      comments: [],
      users: [],
    };
  }

  render() {
    const { playing, volume, played, loaded, playbackRate } = this.state;
    const { soundcloudConfig, vimeoConfig, youtubeConfig, fileConfig } = this.state;
    const { playingVideo } = this.state;
    const headerNode = (
      <header className="sss-header">
        <span className="text-small">Now Playing</span> {this.state.playingVideo.title}
      </header>
    );
    const searchResultNode = this.state.searchResult.map((result, i) => (
      <ul key={i} className="list-group" onClick={() => this.onClickSetQue(result)}>
        <li className="list-group-item">
          <img
            className="img-circle"
            src={result.thumbnail.url}
            width="32"
            height="32"
            alt=""
          ></img>
          <div className="media-body">
            <strong>{result.title}</strong>
          </div>
        </li>
      </ul>
    ));
    const queNode = this.state.que.map((video, i) => (
      <div key={i}>
        <li
          className="slist-group-item"
          onClick={() => this.onClickSetPlayingVideo(video)}
        >
          <img
            className="img-circle media-object pull-left"
            src={video.thumbnail.url}
            width="32"
            height="32"
            alt=""
          ></img>
          <div className="media-body">
            <strong>{video.title}</strong>
          </div>
        </li>
        <div>
          <span className="icon icon-cancel" onClick={() => this.onClickDeleteQue(video)}>x</span>
        </div>
      </div>
    ));

    const commentsNode = this.state.comments.map((comment, i) => (
      <li key={i}>
        {comment}
      </li>
    ));
    return (
      <div>
        <div className="sss-youtube-wrapper is-covered">
          hello
        </div>
        <table><tbody>
          <tr>
            <th>Controls</th>
            <td>
              <button onClick={this.stop}>Stop</button>
              <button onClick={this.playPause}>{playing ? 'Pause' : 'Play'}</button>
            </td>
          </tr>
          <tr>
            <th>Seek</th>
            <td>
              <input
                type="range" min={0} max={1} step="any"
                value={played}
                onMouseDown={this.onSeekMouseDown}
                onChange={this.onSeekChange}
                onMouseUp={this.onSeekMouseUp}
              />
            </td>
          </tr>
          <tr>
            <th>Volume</th>
            <td>
              <input
                type="range" min={0} max={1} step="any" value={volume} onChange={this.setVolume}
              />
            </td>
          </tr>
          <tr>
            <th>Played</th>
            <td><progress max={1} value={played} /></td>
          </tr>
          <tr>
            <th>Loaded</th>
            <td><progress max={1} value={loaded} /></td>
          </tr>
        </tbody></table>
        <table><tbody>
          <tr>
            <th>volume</th>
            <td>{volume.toFixed(3)}</td>
          </tr>
          <tr>
            <th>played</th>
            <td>{played.toFixed(3)}</td>
          </tr>
          <tr>
            <th>loaded</th>
            <td>{loaded.toFixed(3)}</td>
          </tr>
        </tbody></table>
        {headerNode}
        <div className="controlls">
          <div className="pane comment-box">
            <ul className="comment-list-group">
              {commentsNode}
            </ul>
            <input
              className="comment-input"
              type="text"
              placeholder="type comment"
              onChange={(e) => this.onChangeText('commentText', e.target.value)}
              onKeyPress={this.onKeyPressForComment}
              value={this.state.commentText}
            >
            </input>
          </div>

          <div className="pane list-box">
            <h5 className="nav-group-title">
              <span className="icon icon-music"></span>
              Up Coming({this.state.que.length} videos}
            </h5>
            <ul className="list-group">
              {queNode}
            </ul>
          </div>

          <div className="pane">
            <ul className="list-group">
              <li className="list-group-header">
                <span className="icon icon-search"></span>
                <input
                  className="form-control"
                  type="text"
                  placeholder="Search for something you want"
                  onChange={(e) => this.onChangeText('searchText', e.target.value)}
                  onKeyPress={this.onKeyPressForSearch}
                  value={this.state.searchText}
                >
                </input>
              </li>
            </ul>
            <h5 className="nav-group-title">Search Result</h5>
            {searchResultNode}
          </div>

        </div>
      </div>
    );
  }
}

export default App;
