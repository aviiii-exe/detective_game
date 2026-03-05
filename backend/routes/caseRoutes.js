const express = require("express");

const router = express.Router();

const {startGame, chat, makeAccusation} = require("../controllers/caseController");

router.post("/start-case", startGame);

router.post("/chat", chat);

router.post("/accuse", makeAccusation);

module.exports = router