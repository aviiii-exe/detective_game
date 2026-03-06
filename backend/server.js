const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require("./config/db.js");

const caseRoutes = require("./routes/caseRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server running");
});

app.use("/api", caseRoutes);

// --- NEW AI BRIDGE ROUTE ---
app.post('/api/generate-case-list', async (req, res) => {
  try {
    // Forwards the request to your Python server on Port 8000
    const pythonResponse = await fetch('http://127.0.0.1:8000/api/generate-case-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const data = await pythonResponse.json();
    res.json(data);
  } catch (error) {
    console.error('Error bridging to Python:', error);
    res.status(500).json({ error: 'Failed to connect to AI brain' });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});