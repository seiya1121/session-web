import React from 'react';
import ReactBaseComponent from './reactBaseComponent';
import { YOUTUBE_API_KEY } from '../secret';
import { base } from '../firebaseApp';
import YouTubeNode from 'youtube-node';
import ReactPlayer from 'react-player';

const SyncStates = [
  { state: 'que', asArray: true },
  { state: 'users', asArray: true },
  { state: 'comments', asArray: true },
  { state: 'playingVideo', asArray: false },
  { state: 'playing', asArray: false },
  { state: 'startTime', asArray: false},
];
const youtubeUrl = (videoId) => `https://www.youtube.com/watch?v=${videoId}`;

class App extends ReactBaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      playing: true,
      volume: 0.8,
      startTime: 0,
      played: 0,
      loaded: 0,
      duration: 0,
      seeking: false,
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
    this.bind('onChangeText', 'videoSearch', 'setPlayingVideo', 'notification');
    this.bind('onKeyPressForSearch', 'onKeyPressForComment');
    this.bind('onClickSetQue', 'onClickDeleteQue');
    // For YouTube Player
    this.bind('playPause', 'stop', 'setVolume', 'onSeekMouseDown', 'onSeekMouseUp', 'onSeekChange')
    this.bind('onEnded', 'onPlay', 'onProgress', 'onReady');
  }

  componentWillMount() {
    SyncStates.forEach((obj) => {
      const { state, asArray } = obj;
      base.bindToState(state, { context: this, state, asArray });
    });
  }

  componentDidMount() {
    SyncStates.forEach((obj) => {
      const { state, asArray } = obj;
      base.syncState(state, { context: this, state, asArray });
    });
    base.listenTo('startTime',{
      context: this,
      asArray: false,
      then(startTime) {
        this.setState({ played: startTime, seeking: false });
        this.player.seekTo(startTime)
      },
    });
  }

  playPause() {
    this.setState({ playing: !this.state.playing, startTime: this.state.played });
  }

  stop() {
    if (this.state.que.length > 0) {
      this.setPlayingVideo(this.state.que[0]);
    } else {
      this.setState({ playing: false, playingVideo: '', startTime: 0 });
    }
  }

  setPlayingVideo(video) {
    this.setState({
      playing: true,
      playingVideo: video,
      startTime: 0,
      que: this.state.que.filter((item) => item.key !== video.key),
      comments: [...this.state.comments, `play ${video.title}`],
    });
  }

  notification(title, option) {
    const notification = new Notification(
      `${title} (${this.state.que.length + 1} remained)`,
      { body: option.body, icon: option.icon, silent: true }
    );
    return notification;
  }

  onClickSetPlayingVideo(video) {
    this.setPlayingVideo(video);
  }

  onProgress(state) {
    if (!this.state.seeking) { this.setState(state); }
  }

  onPlay(video) {
    this.setState({ playing: true });
    this.notification('Now Playing♪', { body: video.title, icon: video.thumbnail.url });
  }

  onEnded() {
    if (this.state.que.length > 0) {
      this.setPlayingVideo(this.state.que[0]);
    } else {
      this.setState({ playingVideo: '', startTime: 0 });
    }
  }

  onReady() {
    console.log('onReady');
    this.setState({ playing: true });
  }

  onClickSetQue(video) {
    const { que } = this.state;
    const { title, thumbnail } = video;
    if (que.length === 0 && this.state.playingVideo === '') {
      this.setState({ playingVideo: video });
    } else {
      this.setState({ que: [...que, video] });
      this.notification('New Video Added!', { body: title, icon: thumbnail.url });
    }
  }

  onClickDeleteQue(video) {
    this.setState({ que: this.state.que.filter((item) => item.key !== video.key) });
  }

  onKeyPressForSearch(e) {
    if (e.which !== 13) return false;
    e.preventDefault();
    this.videoSearch();
    return true;
  }

  onKeyPressForComment(e) {
    if (e.which !== 13) return false;
    e.preventDefault();
    this.setState({ comments: [...this.state.comments, e.target.value], commentText: '' });
    return true;
  }

  onChangeText(type, value) {
    this.setState({ [type]: value });
  }

  setVolume(e) {
    this.setState({ volume: parseFloat(e.target.value) });
  }

  onSeekMouseDown() {
    this.setState({ seeking: true });
  }

  onSeekMouseUp(e) {
    this.setState({ seeking: false, startTime: parseFloat(e.target.value) });
    this.player.seekTo(parseFloat(e.target.value));
  }

  onSeekChange(e) {
    this.setState({
      played: parseFloat(e.target.value),
    });
  }

  videoSearch() {
    const youTubeNode = new YouTubeNode();
    youTubeNode.setKey(YOUTUBE_API_KEY);
    youTubeNode.search(
      this.state.searchText,
      50,
      (error, result) => {
        if (error) {
          console.log(error);
        } else {
          this.setState({
            searchResultNum: result.items.length,
            searchResult: result.items.map((it) => (
              {
                videoId: it.id.videoId,
                title: it.snippet.title,
                thumbnail: it.snippet.thumbnails.default,
              }
            )),
          });
        }
      }
    );
  }

  render() {
    const { playing, volume, played, loaded } = this.state;
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
          <ReactPlayer
            ref={(player) => { this.player = player; }}
            className="react-player"
            width={480}
            height={270}
            url={youtubeUrl(playingVideo.videoId)}
            playing={playing}
            volume={volume}
            soundcloudConfig={soundcloudConfig}
            vimeoConfig={vimeoConfig}
            youtubeConfig={youtubeConfig}
            fileConfig={fileConfig}
            onReady={this.onReady}
            onStart={() => console.log('onStart')}
            onPlay={() => this.onPlay(playingVideo)}
            onPause={() => this.setState({ playing: false })}
            onBuffer={() => console.log('onBuffer')}
            onEnded={() => this.setState({ playing: false })}
            onError={(e) => console.log('onError', e)}
            onProgress={this.onProgress}
            onDuration={(duration) => this.setState({ duration })}
          />
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
