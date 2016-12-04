require('dotenv').config();
const argv           = require('yargs').argv;
const migrate        = require('./src/migrate.js');
const winston        = require('winston');

const port  = process.env.SERVER_PORT || 8080;
const host  = process.env.SERVER_HOST || 'localhost';

function runServer() {
  const workerPromise = require('./src/worker.js');
  const server        = require('./src/server.js');

  return workerPromise.then((worker) => {
    server.listen(port, host, () => {
      winston.info(`Server started on ${host}:${port}`);
      worker.start();
    });

    process.on('SIGINT', () => {
      worker.stop();
      server.close();
    });
  });
}

if (argv['run-with-migrations']) {
  migrate().then(runServer);
} else if (argv['migrate']) {
  migrate();
} else {
  runServer();
}