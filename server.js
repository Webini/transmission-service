require('dotenv').config();
const argv = require('yargs').argv;
const migrate = require('./src/migrate.js');
const winston = require('winston');
const waitForIt = require('./src/utils/waitForIt.js');
const url = require('url');
const LOG_PREFIX = 'TransmissionService';

const rabbitUrl = process.env.RABBITMQ_URL
  ? url.parse(process.env.RABBITMQ_URL)
  : null;
const port = process.env.SERVER_PORT || 8080;
const host = process.env.SERVER_HOST || 'localhost';

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

function waitRabbit() {
  if (rabbitUrl === null) {
    return Promise.resolve();
  }

  return waitForIt(rabbitUrl.hostname, rabbitUrl.port || 5672, 60000, 5000);
}

if (argv['run-with-migrations']) {
  migrate()
    .then(waitRabbit)
    .then(runServer);
} else if (argv['migrate']) {
  migrate();
} else {
  waitRabbit().then(runServer);
}
