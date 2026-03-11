const express = require("express");
const router = express.Router();

const upload = require("../config/multer");
const { uploadDocument } = require("../controllers/documentController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.post("/", authenticateToken, upload.single("file"), uploadDocument);

module.exports = router;