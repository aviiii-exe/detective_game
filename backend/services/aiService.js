const axios = require('axios');

async function generateMystery(difficulty, theme = "Cyberpunk") {
  try {
    // This MUST match the Python server in main.py
    const response = await axios.post('http://127.0.0.1:8000/api/start-case', {
      case_theme: theme,
      difficulty: difficulty
    });
    return response.data;
  } catch (error) {
    console.error("AI Service Error:", error.message);
    throw error;
  }
}

module.exports = { generateMystery };