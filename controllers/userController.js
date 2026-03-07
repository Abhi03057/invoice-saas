const pool = require("../db/connection");
const bcrypt = require("bcrypt");

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, organization_id } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (name,email,password_hash,organization_id) VALUES ($1,$2,$3,$4) RETURNING *",
      [name, email, hashedPassword, organization_id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating user");
  }
};