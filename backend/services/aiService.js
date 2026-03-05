function generateMystery() {
  return {
    story: "A programmer disappeared after pushing a commit at 3:47 AM.",
        suspects: ["Alex", "Sam", "Riley"],
        clues: [
            "Coffee receipt at 2:55 AM",
            "Laptop login at 3:42 AM",
            "Commit pushed at 3:47 AM"
        ],
        culprit: "Sam",
        explanation: "Sam lied about leaving early."
  }
}

module.exports = {generateMystery}