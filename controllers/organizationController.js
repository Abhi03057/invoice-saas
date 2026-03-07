const pool = require("../db/connection");

exports.createOrganization = async (req, res) => {
  try {
    const { name, email } = req.body;

    const result = await pool.query(
      "INSERT INTO organizations (name, email) VALUES ($1,$2) RETURNING *",
      [name, email]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating organization");
  }
};