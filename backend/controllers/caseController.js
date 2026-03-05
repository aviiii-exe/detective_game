const {generateMystery} = require("../services/aiService.js");

async function generateCase(req, res){
  try{
    const mystery = await generateMystery();
    res.json(mystery);
  }
  catch(error){
    res.status(500).json({
      error: "Failed to generate mystery"
    });
  }
}

module.exports = {generateCase}
