/**
 * Polyfill para Platform de React Native
 */

const Platform = {
  OS: 'web',
  select: function(obj) {
    return obj.web || obj.default || {};
  },
  Version: 1,
  isTesting: false,
  isTV: false,
  isPad: false,
  isTablet: false,
};

export default Platform;
