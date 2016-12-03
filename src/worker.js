const updater      = require('./updater');
const Worker       = require('./worker/worker.js');
const transmission = require('./transmission/api.js');

module.exports = updater.init().then((updater) => {
  return new Worker(transmission, updater, process.env.TRANSMISSION_SYNC_DELAY || 500);
});