const express = require("express");
const router = express.Router();
const db = require("../db");
const authMiddleware = require("../middleware/auth");

// Get all tags
router.get("/", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM tags ORDER BY name ASC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a custom tag
router.post("/", authMiddleware, async (req, res) => {
  const { name } = req.body;
  try {
    const [result] = await db.query("INSERT INTO tags (name) VALUES (?)", [
      name.toLowerCase(),
    ]);
    res.json({ id: result.insertId, name: name.toLowerCase() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
