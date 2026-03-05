const axios = require("axios");

const AI_SERVICE_URL = "http://localhost:8000";

async function startCase(data){
  const response = await axios.post(`${AI_SERVICE_URL}/api/start-case`, data);
  return response.data;
}

async function chatWithSuspect(data){
  const response = await axios.post(`${AI_SERVICE_URL}/api/chat`, data);
  return response.data;
}

async function accuse(data){
  const reponse = await axios.post(`${AI_SERVICE_URL}/api/accuse`, data);
  return response.data;
}

module.exports = {startCase, chatWithSuspect, accuse};