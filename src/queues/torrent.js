const Queue = require('bull');

module.exports = process.env.REDIS_HOST
  ? new Queue('torrent', {
      redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
      },
      defaultJobOptions: {
        attempts: 4,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: 500,
      },
    })
  : null;
