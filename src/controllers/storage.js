const transmission = require('../transmission/api.js');
const LOG_PREFIX = 'StorageController';

module.exports = {
  getFree: function(req, res) {
    transmission
      .freeSpaceAsync(process.env.TRANSMISSION_STORAGE_PATH)
      .then(results => res.apiSuccess(results['size-bytes']))
      .catch(err => res.apiError(LOG_PREFIX, 'Unknown error', err));
  },
};
