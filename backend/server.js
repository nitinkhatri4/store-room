const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/items", require("./routes/items"));
app.use("/api/tags", require("./routes/tags"));
app.use("/api/chats", require("./routes/chats"));
app.use("/api/upload", require("./routes/upload"));

app.get("/", (req, res) => res.send("Storeroom API running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
