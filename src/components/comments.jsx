import React from 'react';
import classNames from 'classnames';
import giphy from 'giphy-api';
import { push } from '../scripts/db.js';
import { base } from '../config/firebaseApp';

const CommentType = { text: 'text', log: 'log', gif: 'gif' };
const commentObj = (content, user, type, keyword) => (
		Object.assign({ content, user, type, keyword })
);
const CommandType = { giphy: '/giphy ' };

class Comments extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
						commentText: '',
						isCommentActive: false,
						comments: [],
    };

    this.setGifUrl = this.setGifUrl.bind(this);
    this.onKeyPressForComment = this.onKeyPressForComment.bind(this);
  }

		componentDidMount() {
				base.listenTo('comments', { context: this, asArray: true, then(comments) {
						this.setState({ comments });
				}});
  }

  setGifUrl(keyword) {
    const key = keyword.replace(CommandType.giphy, '');
    const giphyApp = giphy({ apiKey: 'dc6zaTOxFJmzC' });
    giphyApp.random(key).then((res) => {
      const imageUrl = res.data.fixed_height_downsampled_url;
      const comment = commentObj(imageUrl, this.props.currentUser, CommentType.gif, key);
      this.props.actions.asyncPushComment(comment);
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
        this.props.currentUser,
        CommentType.text,
        ''
      );
						push('comments', comment);
						this.setState({ commentText: '' });
    }
    return true;
  }

  render() {
    const comments = (this.state.isCommentActive) ?
     this.state.comments : this.state.comments.slice(this.state.comments.length - 3, this.state.comments.length);

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
            { 'is-active': this.state.isCommentActive },
          )}
        >
          {commentsNode}
        </ul>
        <input
          className={classNames('comment-input', { 'is-active': !this.state.isCommentActive })}
          type="text"
          placeholder="type comment"
          onChange={(e) => this.setState({ commentText: e.target.value })}
          onFocus={() => this.setState({ isCommentActive: true })}
          onBlur={() => this.setState({ isCommentActive: false })}
          onKeyPress={this.onKeyPressForComment}
          value={this.state.commentText}
        >
        </input>
      </div>
    )
  }
}

Comments.propTypes = {
  currentUser: React.PropTypes.object,
};

export default Comments;
