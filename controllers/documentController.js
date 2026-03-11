const pool = require("../db/connection");

exports.uploadDocument = async (req, res) => {
  try {

    const organizationId = req.user.organization_id;

    const filePath = req.file.path;

    const result = await pool.query(
      "INSERT INTO documents (organization_id, file_path) VALUES ($1,$2) RETURNING *",
      [organizationId, filePath]
    );

    res.json({
      message: "Document uploaded successfully",
      document: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Error uploading document");
  }
};