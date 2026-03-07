from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json
import re
import requests # Added to talk to your local AI!
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()


app.add_middleware(  # type: ignore
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# We can keep this here just in case you ever want to switch back to Gemini!
api_key = os.getenv("GEMINI_API_KEY")

# --- PYDANTIC MODELS (Kept exactly the same) ---
class GameSetupRequest(BaseModel):
    case_theme: str      
    difficulty: str      

class ChatRequest(BaseModel):
    suspect_name: str
    question: str
    suspect_bio: str
    is_murderer: bool
    difficulty: str

class AccusationRequest(BaseModel):
    accused_suspect: str
    user_reason: str     
    actual_murderer: str 

class CaseListRequest(BaseModel):
    difficulty: str

class CaseSummary(BaseModel):
    id: int
    title: str
    desc: str
    keyword: str

class CaseListResponse(BaseModel):
    cases: list[CaseSummary]

# --- OLLAMA HELPER FUNCTION ---
# This makes calling your local GPU super clean
def ask_local_gpu(prompt: str, expect_json: bool = False):
    payload = {
        "model": "llama3.2",
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.3, 
            "num_ctx": 2048     
        }
    }
    
    if expect_json:
        payload["format"] = "json"
        
    response = requests.post("http://localhost:11434/api/generate", json=payload)
    
    if response.status_code == 200:
        return response.json()["response"]
    else:
        raise Exception(f"Local AI failed with status: {response.status_code}")
    
# --- API ENDPOINTS ---

@app.post("/api/generate-case-list")
async def generate_case_list(request: CaseListRequest):
    print(f"Generating case list for difficulty: {request.difficulty} on LOCAL GPU...")

    prompt = f"""
    You are a master mystery game designer. Generate a list of exactly 6 distinct murder mystery concepts for a player of "{request.difficulty}" skill level.

    For each case, provide:
    1. A catchy, noir-style Title.
    2. A 2-sentence Description of the initial crime scene or premise.
    3. A 4-5 word visual Keyword string to generate a noir/cyberpunk atmospheric image of the location (e.g., "rainy neon alleyway body", "gothic mansion library dark").

    Respond ONLY with a valid JSON object containing a single key "cases", which is a list of 6 objects. Each object must have "id" (numbered 1-6), "title", "desc", and "keyword".
    """

    try:
        raw_text = ask_local_gpu(prompt, expect_json=True)
        
        # Clean up and parse the JSON
        start_idx = raw_text.find('{')
        end_idx = raw_text.rfind('}') + 1
        
        if start_idx != -1 and end_idx != 0:
            clean_json = raw_text[start_idx:end_idx]
            print("--- LOCAL AI CASE LIST GENERATED ---")
            return json.loads(clean_json)
        else:
            raise ValueError("No JSON found")
            
    except Exception as e:
        print(f"Error generating case list: {e}")
        return {
            "cases": [
                {"id": 1, "title": "Database Offline", "desc": "Neural link failed. Using cached archives.", "keyword": "broken computer screen glitch"}
            ]
        }

@app.post("/api/start-case")
async def start_case(request: GameSetupRequest):
    """
    Trigger 1: User selects case and difficulty.
    Action: Generate the opening narration AND the suspects dynamically.
    """
    prompt = f"""
    You are a master mystery writer creating a game. 
    Theme: '{request.case_theme}'
    Difficulty: '{request.difficulty}'
    
    You must respond ONLY with a valid JSON object representing the game setup. Do not include any other text.
    Use this exact JSON structure:
    {{
        "narration": "Write a highly suspenseful, 3-sentence opening narration setting the scene. Do not reveal the killer.",
        "suspects": [
            {{
                "name": "Character Name", 
                "hover_bio": "Write a full, detailed 2-sentence description of who they are, their personality, and a subtle reason they might be a suspect."
            }},
            {{
                "name": "Character Name", 
                "hover_bio": "Write a full, detailed 2-sentence description of who they are, their personality, and a subtle reason they might be a suspect."
            }},
            {{
                "name": "Character Name", 
                "hover_bio": "Write a full, detailed 2-sentence description of who they are, their personality, and a subtle reason they might be a suspect."
            }}
        ],
        "actual_murderer": "The exact name of the suspect who actually committed the crime."
    }}
    """

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        
        # Clean up the response
        raw_text = response.text.replace("```json", "").replace("```", "").strip()
        
        # FIX: Remove trailing commas that commonly break json.loads
        raw_text = re.sub(r',\s*]', ']', raw_text)
        raw_text = re.sub(r',\s*}', '}', raw_text)
        
        game_data = json.loads(raw_text)
        return game_data
        
    except Exception as e:
        # THE SAFETY NET! 
        print(f"CRITICAL ERROR IN START-CASE: {e}")
        try:
            print(f"RAW TEXT WAS: {raw_text}")
        except:
            pass
            
        # Fallback Case so the frontend never crashes to a white screen!
        return {
            "narration": "The neural uplink encountered severe interference. Forensic data is corrupted, but you must proceed with the cached emergency dossier.",
            "suspects": [
                {"name": "System Glitch", "hover_bio": "An anomaly in the database. Its alibi is mathematically impossible."},
                {"name": "Corrupt Sector", "hover_bio": "Missing data fragments. Refuses to compile its memory logs."},
                {"name": "Phantom User", "hover_bio": "An unauthorized access log. Leaves no digital footprints."},
                {"name": "The Architect", "hover_bio": "The one who wrote the flawed code. Always blames the framework."}
            ],
            "actual_murderer": "The Architect"
        }

@app.post("/api/chat")
async def chat_with_suspect(request: ChatRequest):
    print(f"Chatting with {request.suspect_name} on LOCAL GPU...")
    
    if request.is_murderer:
        guilt_status = "You are GUILTY of the murder. You must hide this. Be evasive, give a fake alibi (like a fake time or place), or get defensive. NEVER confess."
    else:
        guilt_status = "You are INNOCENT. You did not kill anyone, but you might be hiding an embarrassing secret. Answer the questions, but act annoyed."

    difficulty_rule = ""
    if request.difficulty.lower() == "hard":
        difficulty_rule = "Be very uncooperative, hostile, or give answers that are technically true but intentionally misleading."

    prompt = f"""
    You are roleplaying as a suspect in a murder mystery game. Do not break character. Do not act like an AI.
    
    Your Name: {request.suspect_name}
    Your Background: {request.suspect_bio}
    
    {guilt_status}
    
    The detective asks you: "{request.question}"
    
    STRICT RULES FOR YOUR RESPONSE:
    1. Respond directly to the detective's question. If they ask about a time or place, you MUST mention a specific time or place.
    2. Keep your answer brief, 1 to 2 short sentences maximum.
    3. Reflect your personality from your background.
    {difficulty_rule}
    """

    # Notice expect_json=False because we just want normal text for chat!
    reply_text = ask_local_gpu(prompt, expect_json=False) 
    return {"reply": reply_text.strip()}


@app.post("/api/accuse")
async def make_accusation(request: AccusationRequest):
    print(f"Evaluating accusation on LOCAL GPU...")
    
    if request.accused_suspect != request.actual_murderer:
        return {
            "success": False, 
            "message": f"You arrested {request.accused_suspect}, but the real killer is still out there. You failed the case."
        }
    
    prompt = f"""
    You are the judge of a detective game.
    The player correctly guessed that the murderer is {request.actual_murderer}.
    The player's explanation for WHY they did it is: "{request.user_reason}"
    
    Evaluate their explanation. Is it a logical guess based on standard murder mystery tropes, or did they just type random gibberish?
    
    Respond ONLY with a valid JSON object using this exact structure. 
    You MUST use lowercase 'true' or 'false' for the boolean value:
    {{
        "success": false,
        "message": "You got the right person, but your logic is terrible. Drawing pictures does not make someone a murderer."
    }}
    """

    try:
        raw_text = ask_local_gpu(prompt, expect_json=True)
        start_idx = raw_text.find('{')
        end_idx = raw_text.rfind('}') + 1
        
        if start_idx != -1 and end_idx != 0:
            clean_json = raw_text[start_idx:end_idx]
            return json.loads(clean_json)
        else:
            raise ValueError("No JSON found")
            
    except Exception as e:
        print(f"Error evaluating accusation: {e}")
        return {
            "success": False, 
            "message": "The judge is reviewing your paperwork, but someone spilled coffee on the files! (AI Format Error)."
        }