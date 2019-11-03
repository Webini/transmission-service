const disk = require('diskusage');
const LOG_PREFIX = 'StorageController';

module.exports = {
  get: function(req, res) {
    disk
      .check(process.env.TRANSMISSION_STORAGE_PATH)
      .then(results => res.apiSuccess(results))
      .catch(err => res.apiError(LOG_PREFIX, 'Unknown error', err));
  },
};
