const express = require("express");
const router = express.Router();
const db = require("../db");
const authMiddleware = require("../middleware/auth");

router.get("/:chatId", authMiddleware, async (req, res) => {
  try {
    const [items] = await db.query(
      "SELECT * FROM items WHERE chat_id = ? ORDER BY created_at ASC",
      [req.params.chatId],
    );
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// router.post("/", authMiddleware, async (req, res) => {
//   const { type, title, content, chat_id, file_name, file_type } = req.body;
//   try {
//     const [result] = await db.query(
//       "INSERT INTO items (type, title, content, chat_id, file_name, file_type) VALUES (?, ?, ?, ?, ?, ?)",
//       [type, title, content, chat_id, file_name || null, file_type || null],
//     );
//     const [newItem] = await db.query("SELECT * FROM items WHERE id = ?", [
//       result.insertId,
//     ]);
//     res.json(newItem[0]);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

router.post("/", authMiddleware, async (req, res) => {
  const { type, title, content, chat_id, file_name, file_type } = req.body;
  console.log("POST /items body:", req.body); // add this
  try {
    const [result] = await db.query(
      "INSERT INTO items (type, title, content, chat_id, file_name, file_type) VALUES (?, ?, ?, ?, ?, ?)",
      [type, title, content, chat_id, file_name || null, file_type || null],
    );
    const [newItem] = await db.query("SELECT * FROM items WHERE id = ?", [
      result.insertId,
    ]);
    res.json(newItem[0]);
  } catch (err) {
    console.error("DB error:", err.message); // add this
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  try {
    await db.query("UPDATE items SET title = ?, content = ? WHERE id = ?", [
      title,
      content,
      req.params.id,
    ]);
    const [updated] = await db.query("SELECT * FROM items WHERE id = ?", [
      req.params.id,
    ]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await db.query("DELETE FROM items WHERE id = ?", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
