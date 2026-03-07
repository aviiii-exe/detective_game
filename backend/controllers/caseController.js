const { generateCaseList, startCase, chatWithSuspect, accuse } = require("../services/aiService.js");
const Game = require("../models/Game");
const mongoose = require("mongoose");

async function startGame(req, res) {
  try {
    
    const data = await startCase(req.body);
    const suspects = data.suspects.map(s => s.name);

    
    const game = await Game.create({
      case_theme: req.body.case_theme,
      difficulty: req.body.difficulty,
      suspects: suspects,
      actual_murderer: data.actual_murderer
    });

    
    res.json({
      gameId: game._id, 
      ...data
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
    

    const game = await Game.findById(new mongoose.Types.ObjectId(gameId));

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    const currentCount = game.questions_used.get(suspect_name) || 0;

    if (currentCount >= 3) {
      return res.json({ message: "Subject refuses to answer further questions" });
    }

    game.questions_used.set(suspect_name, currentCount + 1);
    await game.save();

    
    const data = await chatWithSuspect({suspect_name, ...chatPayload});
    res.json(data);

  } catch (error) {
    res.status(500).json({ error: "Failed to chat" });
  }
}

async function makeAccusation(req, res) {
  try {
    const { gameId, accused_suspect, user_reason } = req.body;
    const game = await Game.findById(new mongoose.Types.ObjectId(gameId));

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

   
    const aiEvaluation = await accuse({
      accused_suspect: accused_suspect,
      user_reason: user_reason,
      actual_murderer: game.actual_murderer 
    });

    game.status = "completed";
    await game.save();

    res.json(aiEvaluation);

  } catch (error) {
    res.status(500).json({ error: "Failed to make accusation" });
  }
}

module.exports = { getCaseList, startGame, chat, makeAccusation };