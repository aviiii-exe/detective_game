const axios = require("axios")

const AI_SERVICE_URL = "http://127.0.0.1:8000"

async function startCase(data) {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/api/start-case`, data)
    return response.data
  } catch (error) {
    console.error("AI startCase error:", error.message)
    throw error
  }
}

async function chatWithSuspect(data) {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/api/chat`, data)
    return response.data
  } catch (error) {
    console.error("AI chat error:", error.message)
    throw error
  }
}

async function accuse(data) {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/api/accuse`, data)
    return response.data
  } catch (error) {
    console.error("AI accuse error:", error.message)
    throw error
  }
}

module.exports = {
  startCase,
  chatWithSuspect,
  accuse
}