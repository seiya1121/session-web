import React from 'react';

export default class ReactBaseComponent extends React.Component {
  bind(...methods) {
    methods.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }
  bindRedux(...methods) {
    methods.forEach((method) => {
      this[method] = this.props.appActions[method].bind(this);
    });
  }
}
