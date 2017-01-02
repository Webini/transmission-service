const tcpPortUsed = require('tcp-port-used');

/**
 * @param {string} host
 * @param {integer} port
 * @param {integer} timeout
 * @param {integer} afterWait When host is up wait X ms and resolve Promise
 * @param {integer} retryEach retry each X ms 
 * @returns {Promise}
 */
module.exports = function(host, port, timeout, afterWait = null, retryEach = 500) {
  return new Promise((resolve, reject) => {
    tcpPortUsed
      .waitUntilUsedOnHost(port, host, retryEach, timeout)
      .then(() => {
        if (afterWait) {
          setTimeout(() => resolve(), afterWait);
        } else {
          resolve();
        }
      })
      .catch((err) => reject(err));
  });
};