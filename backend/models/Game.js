const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  case_theme: String,
  difficulty: String,
  suspects: [String],
  actual_murderer: String,
  questions_used: {
    type: Map,
    of: Number,
    default: {}
  },
  status: {
    type: String,
    default: "ongoing"
  }
})

module.exports = mongoose.model("Game", gameSchema);