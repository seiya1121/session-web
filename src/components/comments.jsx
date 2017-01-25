import React from 'react';
import ReactBaseComponent from './reactBaseComponent';
import classNames from 'classnames';
import { CommandType, CommentType} from '../constants/app';
import giphy from 'giphy-api';

const commentObj = (content, user, type, keyword) => (
  Object.assign({}, { content, user, type, keyword })
);

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
      const comment = commentObj(imageUrl, this.props.app.currentUser, CommentType.gif, key);
      this.props.appActions.addComment(comment);
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
        this.props.app.currentUser,
        CommentType.text,
        ''
      );
      this.props.appActions.addComment(comment);
    }
    return true;
  }

  render() {
    const {app, appActions} = this.props;
    const comments = (app.isCommentActive) ?
      app.comments : app.comments.slice(app.comments.length - 3, app.comments.length);

    const commentClass = (type, index) => (
      (type === CommentType.log) ?
        classNames(
          'comments-stream__item--play',
          { [`comments-stream__item--play_${index}`]: !app.isCommentActive },
        ) :
        classNames(
          'comments-stream__item',
          { [`comments-stream__item_${index}`]: !app.isCommentActive },
        )
    );

    const commentsNode = comments.map((comment, i) => {
      switch (comment.type) {
        case CommentType.text:
          return (
            <li key={i} className={commentClass(comment.type, i)}>
              <img
                className="comments-stream__img-prof"
                src={comment.user.photoURL}
                alt={comment.user.name}
              />
              <div className="commemt-comment">
                <div className="comment-single">
                  {comment.content}
                </div>
                <div className="comment-author">
                  {comment.user.name}
                </div>
              </div>
            </li>
          );
        case CommentType.log:
          return (
            <li key={i} className={commentClass(comment.type, i)}>
              {comment.content} by {comment.userName}
            </li>
          );
        case CommentType.gif:
          return (
            <li key={i} className={commentClass(comment.type, i)}>
              <p>{comment.keyword}</p>
              <img className="comments-stream__img-giphy" src={comment.content} alt=""></img>
              <div className="comment-author">
                {comment.userName}
              </div>
            </li>
          );
        default:
          return '';
      }
    });

    return(
      <div className="display-comments">
        <ul className="comments-stream">
          {commentsNode}
        </ul>
        <input
          className={classNames('comment-input', { 'is-active': !app.isCommentActive })}
          type="text"
          placeholder="type comment"
          onChange={(e) => { appActions.changeValueWithKey('commentText', e.target.value); }}
          onFocus={() => { appActions.changeValueWithKey('isCommentActive', true); }}
          onBlur={() => { appActions.changeValueWithKey('isCommentActive', false); }}
          onKeyPress={this.onKeyPressForComment}
          value={app.commentText}
        >
        </input>
      </div>
    )
  }
}

Comments.propTypes = {
  app: React.PropTypes.object,
  appActions: React.PropTypes.object,
};

export default Comments;
