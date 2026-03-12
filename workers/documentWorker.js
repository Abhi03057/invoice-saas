const { Worker } = require("bullmq");
const IORedis = require("ioredis");
const pool = require("../db/connection");
const parseInvoice = require("../services/invoiceParser");

const connection = new IORedis({
  maxRetriesPerRequest: null
});

const worker = new Worker(
  "document-processing",
  async job => {

    const { documentId, filePath } = job.data;

    console.log("Processing document:", documentId);

    const extractedData = await parseInvoice(filePath);

    await pool.query(
  `INSERT INTO invoice_data 
   (document_id, invoice_number, invoice_date, amount)
   VALUES ($1,$2,$3,$4)
   ON CONFLICT (invoice_number) DO NOTHING`,
  [
    documentId,
    extractedData.invoice_number,
    extractedData.invoice_date,
    extractedData.total
  ]
);

    await pool.query(
      "UPDATE documents SET status='processed', processed_at=NOW() WHERE id=$1",
      [documentId]
    );

    console.log("Finished processing:", documentId);

  },
  { connection }
);

console.log("Worker started");