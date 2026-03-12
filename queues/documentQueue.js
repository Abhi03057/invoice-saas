const { Queue } = require("bullmq");
const IORedis = require("ioredis");

const connection = new IORedis({
  maxRetriesPerRequest: null
});

const documentQueue = new Queue("document-processing", {
  connection
});

module.exports = documentQueue;