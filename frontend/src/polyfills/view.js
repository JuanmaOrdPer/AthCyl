/**
 * Polyfill para View de React Native
 */
import React from 'react';

const View = React.forwardRef((props, ref) => {
  return React.createElement('div', {
    ...props,
    ref,
    style: {
      display: 'flex',
      flexDirection: 'column',
      ...props.style
    }
  }, props.children);
});

export default View;
