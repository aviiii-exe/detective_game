# 🕵️ THE TURING MURDERS // Forensic OS
> An AI-driven, full-stack cyber-detective simulator powered by local LLMs and a multi-service architecture.

Welcome to the Forensic OS. The Turing Murders is not a standard text adventure; it is a high-stakes, time-sensitive interrogation simulator. Players step into the shoes of a cyber-detective tasked with interrogating AI suspects, extracting forensic data from their dialogue, and proving their guilt to an AI Judge.

## ✨ Core Game Mechanics
- **Dynamic LLM Interrogations**: Suspects are fully autonomous, powered by a local Llama 3.2 instance. They will defend themselves, lie, and drop subtle contextual hints based on their dynamically generated biographies.

- **Precision Evidence Extractor**: Players cannot simply guess the murderer. They must use the mouse to highlight specific suspicious sentences in the chat terminal and click `[+ Extract_Data]` to pin the clue to their Forensic Board.

- **AI Judge Verification (Arrest Protocol)**: To win, players must select their extracted evidence checkboxes and write a logical deduction explaining why the suspect is guilty. An AI Judge evaluates the logic and issues a `SUCCESS` or `FAILURE` verdict.

- **Resource Tension**: The game enforces strict constraints. Players have a maximum of 3 "Neural Link" questions per suspect and a hard countdown timer (e.g., 10, 15, or 20 minutes based on Threat Level) before the suspect flees the jurisdiction.

## 🏗️ Architecture & Tech Stack
This project utilizes a modern, decoupled microservice architecture to separate the UI layer, database routing, and heavy AI inference.

### 1. The Frontend (React + Vite + TypeScript)

- **Styling**: Tailwind CSS with heavy use of arbitrary values for custom neon drop-shadow glows, vignette overlays, and terminal scanline effects.

- **Custom Physics**: Features 3D spring-physics for "Tilted Card" suspect dossiers and buttery-smooth, GPU-accelerated "Genie" pop-up animations built entirely in pure CSS/React without heavy 3rd-party libraries.

- **State Management**: Complex localized state handling for tracking per-suspect question limits, managing the evidence inventory, and seamless infinite-scroll case selection.

### 2. The Backend / API Gateway (Node.js + Express)

- **API Gateway Layer**: The Node.js backend acts as a secure intermediary between the React frontend and the AI microservice, routing all requests and preventing direct client access to the AI system.

- **Session & Evidence Management**: Game sessions, interrogation logs, and extracted evidence are stored in MongoDB, allowing the system to track player progress and verify accusations.

- **Interrogation Constraint Enforcement**: The backend enforces gameplay rules such as the maximum question limit per suspect and session timers, ensuring fair gameplay and maintaining resource tension.

### 3. The AI Microservice (Python + FastAPI)

- **Local Inference**: Uses the `requests` library to communicate with a local Ollama instance running the `llama3.2` model, ensuring completely free, private, and high-speed AI generation.

- **Strict JSON Formatting**: The FastAPI endpoints utilize highly engineered prompt constraints to force the LLM to return strictly formatted JSON objects for case generation, character bios, and verdict logic.

## 🚀 Local Installation & Setup
Because this is a multi-service application, you need to run three separate environments.

**Prerequisites**

- Node.js (v18+)

- Python (3.9+)

- [Ollama](https://ollama.com) installed locally with the Llama 3.2 model pulled (`ollama run llama3.2`).

1. Start the AI Microservice

``` Bash
cd ai-service
pip install fastapi uvicorn requests python-dotenv
uvicorn main:app --reload --port 8000
```
2. Start the Node API
``` Bash
cd backend
npm install
node server.js
```
3. Start the Forensic OS (Frontend)
``` Bash
cd frontend
npm install
npm run dev #runs on port 5001
```
(Note: Ensure your local ngrok tunnels or localhost URLs in App.tsx and Game.tsx are pointed to your active backend ports!)

---
*Made with ❤️ by Avinav Kaushal, Aayush Biswas and Shreyas Naik.*
