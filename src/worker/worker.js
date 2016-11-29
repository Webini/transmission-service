'use strict';

const LOG_PREFIX = 'worker';
const winston  = require('winston');

class Worker {
  constructor(transmission, delay) {
    this.delay = delay;
    this.transmission = transmission;
    this.timer = null;
    this.mutex = 0; 
  }

  _process() {
    this.mutex++;

    this.transmission
      .all()
      .then((data) => {

      })
      .catch((err) => {
        winston.error(LOG_PREFIX, err);
      })
      .then(() => { this.mutex--; });
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


module.export = Worker;