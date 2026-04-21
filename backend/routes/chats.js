const express = require("express");
const router = express.Router();
const db = require("../db");
const authMiddleware = require("../middleware/auth");

// Get all chats for logged in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.*, COUNT(i.id) as item_count 
      FROM chats c 
      LEFT JOIN items i ON i.chat_id = c.id 
      WHERE c.user_id = ? 
      GROUP BY c.id 
      ORDER BY c.created_at DESC`,
      [req.user.id],
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a chat
router.post("/", authMiddleware, async (req, res) => {
  const { name } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO chats (name, user_id) VALUES (?, ?)",
      [name, req.user.id],
    );
    const [chat] = await db.query("SELECT * FROM chats WHERE id = ?", [
      result.insertId,
    ]);
    res.json(chat[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rename a chat
router.put("/:id", authMiddleware, async (req, res) => {
  const { name } = req.body;
  try {
    await db.query("UPDATE chats SET name = ? WHERE id = ? AND user_id = ?", [
      name,
      req.params.id,
      req.user.id,
    ]);
    res.json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a chat and its items
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const chatId = req.params.id;
    const userId = req.user.id;

    const [chat] = await db.query(
      "SELECT * FROM chats WHERE id = ? AND user_id = ?",
      [chatId, userId],
    );

    if (chat.length === 0) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await db.query("DELETE FROM items WHERE chat_id = ?", [chatId]);

    await db.query("DELETE FROM chats WHERE id = ?", [chatId]);

    res.json({
      success: true,
      message: "Chat deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// Generate share link
router.post("/:id/share", authMiddleware, async (req, res) => {
  try {
    const [chat] = await db.query(
      "SELECT * FROM chats WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id],
    );
    if (chat.length === 0)
      return res.status(403).json({ message: "Not authorized" });

    // generate random token
    const token = require("crypto").randomBytes(32).toString("hex");
    await db.query("UPDATE chats SET share_token = ? WHERE id = ?", [
      token,
      req.params.id,
    ]);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Public route - get shared collection by token (no auth)
router.get("/shared/:token", async (req, res) => {
  try {
    const [chats] = await db.query(
      "SELECT * FROM chats WHERE share_token = ?",
      [req.params.token],
    );
    if (chats.length === 0)
      return res.status(404).json({ message: "Not found" });
    const chat = chats[0];
    const [items] = await db.query(
      "SELECT * FROM items WHERE chat_id = ? ORDER BY created_at ASC",
      [chat.id],
    );
    res.json({ chat, items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
