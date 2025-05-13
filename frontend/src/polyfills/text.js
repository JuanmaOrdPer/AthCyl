/**
 * Polyfill para Text de React Native
 */
import React from 'react';

const Text = React.forwardRef((props, ref) => {
  return React.createElement('span', {
    ...props,
    ref,
    style: {
      ...props.style
    }
  }, props.children);
});

export default Text;
