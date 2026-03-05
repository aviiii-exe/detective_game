const express = require("express");

const router = express.Router();
const app = express();

const {generateCase} = require("../controllers/caseController");

router.post("/generate-case", generateCase);

module.exports = router