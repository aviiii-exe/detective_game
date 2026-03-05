const {startCase, chatWithSuspect, accuse} = require("../services/aiService.js");
const Game = require("../models/Game")

async function startGame(req, res){
  try{

    const data = await startCase(req.body)

    const suspects = data.suspects.map(s => s.name)

    const game = await Game.create({
      case_theme: req.body.case_theme,
      difficulty: req.body.difficulty,
      suspects: suspects,
      actual_murderer: data.actual_murderer
    })

    res.json({
      gameId: game._id,
      narration: data.narration,
      suspects: data.suspects
    })

  }
  catch(error){
    res.status(500).json({
      error: "Failed to start case"
    })
  }
}

async function chat(req, res){
  try{

    const { gameId } = req.body

    const game = await Game.findById(gameId)

    if(!game){
      return res.status(404).json({error:"Game not found"})
    }

    if(game.questions_used >= 3){
      return res.json({message:"No questions remaining"})
    }

    game.questions_used += 1
    await game.save()

    const data = await chatWithSuspect(req.body)

    res.json(data)

  }
  catch(error){
    res.status(500).json({
      error: "Failed to chat"
    })
  }
}

async function makeAccusation(req, res){
  try{

    const { gameId, accused } = req.body

    const game = await Game.findById(gameId)

    if(!game){
      return res.status(404).json({error:"Game not found"})
    }

    const correct = accused === game.actual_murderer

    game.status = "completed"
    await game.save()

    res.json({
      correct
    })

  }
  catch(error){
    res.status(500).json({
      error: "Failed to make accusation"
    })
  }
}

module.exports = {startGame, chat, makeAccusation};
