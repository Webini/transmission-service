const workerPromise  = require('./src/worker.js');
const server         = require('./src/server.js');
const winston        = require('winston');

const port  = process.env.SERVER_PORT || 8080;
const host  = process.env.SERVER_HOST || 'localhost';

workerPromise.then((worker) => {
  server.listen(port, host, () => {
    winston.info(`Server started on ${host}:${port}`);
    worker.start();
  });
});