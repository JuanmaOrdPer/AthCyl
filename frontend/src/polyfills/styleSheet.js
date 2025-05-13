/**
 * Polyfill para StyleSheet de React Native
 */

const StyleSheet = {
  create: (styles) => {
    return styles;
  },
  flatten: (style) => {
    if (!style) {
      return {};
    }
    if (!Array.isArray(style)) {
      return style;
    }
    return Object.assign({}, ...style.filter(Boolean));
  },
  absoluteFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  hairlineWidth: 1,
};

export default StyleSheet;
