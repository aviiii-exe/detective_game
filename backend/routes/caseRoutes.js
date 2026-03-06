const express = require("express");

const router = express.Router();

const { getCaseList, startGame, chat, makeAccusation } = require("../controllers/caseController");

router.post("/generate-case-list", getCaseList);

router.post("/start-case", startGame);

router.post("/chat", chat);

router.post("/accuse", makeAccusation);

module.exports = router