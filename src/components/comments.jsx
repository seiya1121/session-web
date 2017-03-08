import React from 'react';
import ReactBaseComponent from './reactBaseComponent';
import classNames from 'classnames';
import { CommandType, CommentType, commentObj } from '../action_types/app';
import giphy from 'giphy-api';

// Redux系
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
import * as CommentsActions from '../actions/comments';

class Comments extends ReactBaseComponent {
  constructor(props) {
    super(props);
    this.bind('setGifUrl', 'onKeyPressForComment');
  }

  setGifUrl(keyword) {
    const key = keyword.replace(CommandType.giphy, '');
    const giphyApp = giphy({ apiKey: 'dc6zaTOxFJmzC' });
    giphyApp.random(key).then((res) => {
      const imageUrl = res.data.fixed_height_downsampled_url;
      const comment = commentObj(imageUrl, this.props.currentUser, CommentType.gif, key);
      this.props.actions.addComment(comment);
    });
  }

  onKeyPressForComment(e) {
    if (e.which !== 13) return false;
    if (e.target.value === '') return false;
    e.preventDefault();
    const commentText = e.target.value;
    const isGif = commentText.includes(CommandType.giphy);
    if (isGif) {
      this.setGifUrl(commentText);
    } else {
      const comment = commentObj(
        commentText,
        this.props.state.currentUser,
        CommentType.text,
        ''
      );
      this.props.actions.addComment(comment);
    }
    return true;
  }

  render() {
    const {state, actions} = this.props;

    // const comments = state.comments;

    const comments = (state.isCommentActive) ?
     state.comments : state.comments.slice(state.comments.length - 3, state.comments.length);

    const commentClass = (type, index) => (
      (type === CommentType.log) ?
        classNames('comments-stream__item--play') :
        classNames('comments-stream__item')
    );

    const commentsNode = comments.map((comment, i) => {
      switch (comment.type) {
        case CommentType.text:
          return (
            <li key={i} className={commentClass(comment.type, i)}>
              <img
                className="comments-stream__img-prof"
                src={comment.user.photoURL}
                alt={comment.user.displayName}
              />
              <div className="commemt-comment">
                <div className="comment-single">
                  {comment.content}
                </div>
                <div className="comment-author">
                  {comment.user.displayName}
                </div>
              </div>
            </li>
          );
        case CommentType.log:
          return (
            <li key={i} className={commentClass(comment.type, i)}>
              {comment.content} by {comment.user.displayName}
            </li>
          );
        case CommentType.gif:
          return (
            <li key={i} className={commentClass(comment.type, i)}>
              <p>{comment.keyword}</p>
              <img className="comments-stream__img-giphy" src={comment.content} alt=""></img>
              <div className="comment-author">
                {comment.user.displayName}
              </div>
            </li>
          );
        default:
          return '';
      }
    });

    return(
      <div className="display-comments">
        <ul
          className={classNames(
            'comments-stream',
            { 'is-active': state.isCommentActive },
          )}
        >
          {commentsNode}
        </ul>
        <input
          className={classNames('comment-input', { 'is-active': !state.isCommentActive })}
          type="text"
          placeholder="type comment"
          onChange={(e) => { actions.changeCommentText(e.target.value); }}
          onFocus={() => { actions.changeIsCommentActive(true); }}
          onBlur={() => { actions.changeIsCommentActive(false); }}
          onKeyPress={this.onKeyPressForComment}
          value={state.commentText}
        >
        </input>
      </div>
    )
  }
}

Comments.propTypes = {
  state: React.PropTypes.object,
  actions: React.PropTypes.object,
  currentUser: React.PropTypes.object,
};

const mapStateToProps = (state) => ({ state: state.comments });

const mapDispatchToProps = (dispatch) => ({
		actions: bindActionCreators(CommentsActions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Comments);
