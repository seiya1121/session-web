import * as App from '../constants/app';

export const changeText = (textType, text) => {
  return { type: App.CHANGE_TEXT, textType, text};
}

export const setPlayingVideo = () => {
  
}
