/**
 * Polyfill para RCTAlertManager de React Native
 */

const RCTAlertManager = {
  alertWithArgs: (args, callback) => {
    const { title, message, buttons, type } = args;
    if (typeof window !== 'undefined' && window.alert) {
      window.alert(message || title);
    }
    callback && callback(0);
  }
};

export default RCTAlertManager;
