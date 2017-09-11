import { base } from '../config/firebaseApp.js';

export const push = (stateName, data, func = {}) => base.push(stateName, { data });
export const post = (stateName, data) => base.post(stateName, { data });
export const remove = (endPoint) => base.remove(endPoint);