import * as App from '../constants/app';

const CommentType = { text: 'text', log: 'log', gif: 'gif' };
const commentObj = (content, userName, type) => Object.assign({}, { content, userName, type });

export const changeText = (textType, text) => {
  return { type: App.CHANGE_TEXT, textType, text};
}

export const setPlayingVideo = (video) => {
  console.log(video)
  return {
    type: App.SET_PLAYING_VIDEO,
    video,
    comment: commentObj(`play ${video.title}`, '', CommentType.log)
  };
}
