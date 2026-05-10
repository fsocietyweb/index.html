// server.js
const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const FILE = "guestbook.json";

// Load entries
function readEntries() {
  if (!fs.existsSync(FILE)) return [];
  return JSON.parse(fs.readFileSync(FILE));
}

// Save entries
function saveEntries(entries) {
  fs.writeFileSync(FILE, JSON.stringify(entries, null, 2));
}

// GET all entries
app.get("/guestbook", (req, res) => {
  res.json(readEntries());
});

// POST new entry
app.post("/guestbook", (req, res) => {
  const { name, country, email, message } = req.body;

  // Basic validation
  if (!name || !country || !email || !message) {
    return res.status(400).json({ error: "All fields required" });
  }

  const entries = readEntries();

  const newEntry = {
    id: Date.now(),
    name,
    country,
    email,
    message,
    date: new Date()
  };

  entries.unshift(newEntry);
  saveEntries(entries);

  res.json(newEntry);
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});