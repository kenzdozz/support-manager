class Logger {
  static log(...args) {
    // eslint-disable-next-line no-console
    console.log(new Date().toLocaleString(), '***', ...args);
  }
}

export default Logger;
