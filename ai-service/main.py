from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("No API key found. Check your .env file!")

client = genai.Client(api_key=api_key)

app = FastAPI()

class GameSetupRequest(BaseModel):
    case_theme: str      # e.g., "The Poisoned Professor"
    difficulty: str      # "Easy", "Medium", "Hard"

class ChatRequest(BaseModel):
    suspect_name: str
    question: str
    suspect_bio: str
    is_murderer: bool
    difficulty: str

class AccusationRequest(BaseModel):
    accused_suspect: str
    user_reason: str     # The "why" the user typed in
    actual_murderer: str # Passed from frontend state

# --- API ENDPOINTS ---

import json

@app.post("/api/start-case")
async def start_case(request: GameSetupRequest):
    """
    Trigger 1: User selects case and difficulty.
    Action: Generate the opening narration AND the suspects dynamically.
    """
    
    # 1. We write a highly specific prompt asking for exactly what the frontend needs
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
            }},
            {{
                "name": "Character Name", 
                "hover_bio": "Write a full, detailed 2-sentence description of who they are, their personality, and a subtle reason they might be a suspect."
            }}
        ],
        "actual_murderer": "The exact name of the suspect who actually committed the crime."
    }}
    """

    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt
    )
    
    # 3. Clean up the response (sometimes AI adds markdown formatting like ```json)
    raw_text = response.text.replace("```json", "").replace("```", "").strip()
    
    # 4. Convert the text into a real Python dictionary and send it!
    game_data = json.loads(raw_text)
    
    return game_data

@app.post("/api/chat")
async def chat_with_suspect(request: ChatRequest):
    """
    Trigger 2: User asks one of their 3 questions.
    Action: Suspect replies based on their bio and whether they are guilty.
    """
    
    # 1. Stricter secret instructions
    if request.is_murderer:
        guilt_status = "You are GUILTY of the murder. You must hide this. Be evasive, give a fake alibi (like a fake time or place), or get defensive. NEVER confess."
    else:
        guilt_status = "You are INNOCENT. You did not kill anyone, but you might be hiding an embarrassing secret. Answer the questions, but act annoyed."

    # 2. Add a difficulty modifier rule
    difficulty_rule = ""
    if request.difficulty.lower() == "hard":
        difficulty_rule = "Be very uncooperative, hostile, or give answers that are technically true but intentionally misleading."

    # 3. The Grounded Master Prompt
    prompt = f"""
    You are roleplaying as a suspect in a murder mystery game. Do not break character. Do not act like an AI.
    
    Your Name: {request.suspect_name}
    Your Background: {request.suspect_bio}
    
    {guilt_status}
    
    The detective asks you: "{request.question}"
    
    STRICT RULES FOR YOUR RESPONSE:
    1. Respond directly to the detective's question. If they ask about a time or place, you MUST mention a specific time or place (even if you are lying). Do not be poetic or abstract.
    2. Keep your answer brief, 1 to 2 short sentences maximum.
    3. Reflect your personality from your background.
    {difficulty_rule}
    """

    # 3. Ask Gemini for the character's reply
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt
    )
    
    return {"reply": response.text.strip()}

import json 

@app.post("/api/accuse")
async def make_accusation(request: AccusationRequest):
    """
    Trigger 3: User makes their final guess and explains why.
    Action: AI evaluates if the logic is sound enough to win.
    """
    
    # 1. Did they even guess the right person?
    if request.accused_suspect != request.actual_murderer:
        return {
            "success": False, 
            "message": f"You arrested {request.accused_suspect}, but the real killer is still out there. You failed the case."
        }
    
    # 2. They guessed right! Now, does their reason make sense?
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
        # 3. Ask Gemini to judge the player
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        
        # 4. Clean up the JSON 
        raw_text = response.text.replace("```json", "").replace("```", "").strip()
        
        # DEBUGGING SUPERPOWER: Print the AI's raw text to your VS Code terminal so you can see it!
        print("--- RAW AI RESPONSE ---")
        print(raw_text)
        print("-----------------------")
        
        evaluation = json.loads(raw_text)
        return evaluation
        
    except Exception as e:
        # 5. The Safety Net! If json.loads crashes, catch the error instead of crashing the server.
        print(f"CRASH AVOIDED! Error parsing JSON: {e}")
        return {
            "success": False, 
            "message": "The judge is reviewing your paperwork, but someone spilled coffee on the files! (AI Format Error - Try your accusation again)."
        }