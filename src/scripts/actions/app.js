import * as App from '../constants/app';

export const changeText = (text) => {
  return { type: App.CHANGE_TEXT, text};
}
