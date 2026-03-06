const { generateCaseList, startCase, chatWithSuspect, accuse } = require("../services/aiService.js");
const Game = require("../models/Game");

async function startGame(req, res) {
  try {
    // 1. Fetch from Python AI
    const data = await startCase(req.body);
    const suspects = data.suspects.map(s => s.name);

    // 2. Save to Database
    const game = await Game.create({
      case_theme: req.body.case_theme,
      difficulty: req.body.difficulty,
      suspects: suspects,
      actual_murderer: data.actual_murderer
    });

    // 3. FIX: Send the FULL data payload back to the frontend, plus the gameId
    res.json({
      gameId: game._id, 
      ...data // This unpacks narration, suspects, AND actual_murderer for App.tsx
    });

  } catch (error) {
    res.status(500).json({ error: "Failed to start case" });
  }
}

async function getCaseList(req, res) {
  try {
    const data = await generateCaseList(req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate case list" });
  }
}

async function chat(req, res) {
  try {
    const { gameId, ...chatPayload } = req.body;
    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }
    if (game.questions_used >= 3) {
      return res.json({ message: "No questions remaining" });
    }

    game.questions_used += 1;
    await game.save();

    // Pass the rest of the payload to Python
    const data = await chatWithSuspect(chatPayload);
    res.json(data);

  } catch (error) {
    res.status(500).json({ error: "Failed to chat" });
  }
}

async function makeAccusation(req, res) {
  try {
    const { gameId, accused_suspect, user_reason } = req.body;
    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    // FIX: Ask the Python AI Judge to evaluate the accusation
    const aiEvaluation = await accuse({
      accused_suspect: accused_suspect,
      user_reason: user_reason,
      actual_murderer: game.actual_murderer // Grab truth from the secure DB
    });

    game.status = "completed";
    await game.save();

    // Send the Python response {"success": boolean, "message": string} back to Frontend
    res.json(aiEvaluation);

  } catch (error) {
    res.status(500).json({ error: "Failed to make accusation" });
  }
}

module.exports = { getCaseList, startGame, chat, makeAccusation };