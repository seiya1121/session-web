import { base, firebaseDB } from '../config/firebaseApp.js';

export const push = (stateName, data, func = {}) => base.push(stateName, { data });
export const post = (stateName, data) => base.post(stateName, { data });
export const remove = (endPoint) => base.remove(endPoint);
export const RoomDB = (key, property = '') => {
  console.log(`rooms/${key}/${property}`);
  return firebaseDB.ref(`rooms/${key}/${property}`);
};