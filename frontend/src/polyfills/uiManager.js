/**
 * Polyfill para UIManager de React Native
 */

const UIManager = {
  measure: () => {},
  measureInWindow: () => {},
  measureLayout: () => {},
  updateView: () => {},
  focus: () => {},
  blur: () => {},
  findSubviewIn: () => {},
  dispatchViewManagerCommand: () => {},
  getViewManagerConfig: () => null,
  hasViewManagerConfig: () => false,
};

export default UIManager;
