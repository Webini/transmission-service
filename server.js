require('dotenv').config();
const argv = require('yargs').argv;
const migrate = require('./src/migrate.js');
const winston = require('winston');
const waitForIt = require('./src/utils/waitForIt.js');
const LOG_PREFIX = 'TransmissionService';

const redisHost = process.env.REDIS_HOST || null;
const redisPort = process.env.REDIS_PORT;
const port = process.env.SERVER_PORT || 8080;
const host = process.env.SERVER_HOST || 'localhost';
// silly=0(lowest), debug=1, verbose=2, info=3, warn=4, error=5(highest)
winston.level = process.env.LOG_LEVEL || 'silly';

function runServer() {
  const workerPromise = require('./src/worker.js');
  const server = require('./src/server.js');

  return workerPromise
    .then(worker => {
      server.listen(port, host, () => {
        winston.info(LOG_PREFIX, `Server started on ${host}:${port}`);
        worker.start();
      });

      process.on('SIGINT', () => {
        worker.stop();
        server.close();
        process.exit(0);
      });
    })
    .catch(err => {
      winston.error(LOG_PREFIX, err);
    });
}

function waitRedis() {
  if (redisHost === null) {
    return Promise.resolve();
  }

  return waitForIt(redisHost, redisPort || 6379, 60000, 5000);
}

if (argv['run-with-migrations']) {
  migrate()
    .then(waitRedis)
    .then(runServer);
} else if (argv['migrate']) {
  migrate();
} else {
  waitRedis().then(runServer);
}
