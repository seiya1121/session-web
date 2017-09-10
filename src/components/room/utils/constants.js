export const CommentType = { text: 'text', log: 'log', gif: 'gif' };
export const commentObj = (content, user, type, keyword) => (
  Object.assign({ content, user, type, keyword })
);
