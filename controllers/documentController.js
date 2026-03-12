const pool = require("../db/connection");
const documentQueue = require("../queues/documentQueue");

exports.uploadDocument = async (req, res) => {
  try {

    // check file exists
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const organizationId = req.user.organization_id;
    const filePath = req.file.path;

    // 1️⃣ save document record
    const result = await pool.query(
      "INSERT INTO documents (organization_id, file_path) VALUES ($1,$2) RETURNING *",
      [organizationId, filePath]
    );

    const document = result.rows[0];

    // 2️⃣ add job to queue
    await documentQueue.add("process-document", {
      documentId: document.id,
      filePath: filePath
    });

    // 3️⃣ return response immediately
    res.json({
      message: "Document uploaded. Processing started in background.",
      document
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Error uploading document");
  }
};