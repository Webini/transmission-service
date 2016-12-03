'use strict';

const LOG_PREFIX    = 'worker';
const winston       = require('winston');
const torrentMapper = require('./torrentMapper.js');

class Worker {
  constructor(transmission, updater, delay) {
    this.delay = delay;
    this.updater = updater;
    this.transmission = transmission;
    this.timer = null;
    this.mutex = 0; 
    this.startDate = null;
  }

  _process() {
    this.mutex++; 
    this.startDate = new Date();

    this.transmission
      .allAsync()
      .then((data) => {
        return this.updater.update(
          data.torrents.map((torrent) => {
            return torrentMapper(torrent);
          })
        );
      })
      .catch((err) => {
        winston.error(LOG_PREFIX, err);
      })
      .then(() => { 
        this.mutex--; 
        const duration = (Date.now() - this.startDate.getTime());
        this.startDate = null;
        winston.info(LOG_PREFIX, { msg: `Duration ${duration}ms`, duration});
      });
  }

  /**
   * Stop the worker
   */
  stop() {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Start the worker
   */
  start() {
    this.stop();
    this.mutex = 0;

    this.timer = setInterval(() => {
      if (this.mutex === 0) {
        this._process();
      } else {
        winston.info(LOG_PREFIX, 'Mutex locked', this.mutex);
      }
    }, this.delay);
  }
}


module.exports = Worker;