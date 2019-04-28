const winston = require('winston');

module.exports = function(req, res, next) {
  res.apiError = function(logPrefix, data, error, status = 500) {
    winston.error(logPrefix, { error: error, data: data });
    return this.status(status).json({
      data: data,
      success: false,
    });
  };

  res.apiSuccess = function(data, status = 200) {
    return this.status(status).json({
      data: data,
      success: true,
    });
  };

  next();
};
