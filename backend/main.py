from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import time
import random
import uuid
import sqlite3
import os
from pydantic import BaseModel
from typing import List, Optional
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# --- CONFIGURATION ---
# Replace with your actual key from https://aistudio.google.com/
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY_HERE")

# Initialize Gemini with the latest Gemini 3 model
if GEMINI_API_KEY and "YOUR_GEMINI" not in GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        # Using Gemini 3 Flash for maximum speed and accuracy in video analysis
        model = genai.GenerativeModel('gemini-3-flash-preview')
    except Exception:
        model = None
else:
    model = None

app = FastAPI(title="SportGuard AI Pro API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATABASE SETUP ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "sportguard.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS assets (
            id TEXT PRIMARY KEY,
            name TEXT,
            type TEXT,
            status TEXT,
            fingerprint TEXT,
            description TEXT,
            created_at REAL
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS detections (
            id TEXT PRIMARY KEY,
            asset_id TEXT,
            asset_name TEXT,
            platform TEXT,
            url TEXT,
            match_score REAL,
            risk_level TEXT,
            status TEXT,
            view_count INTEGER,
            timestamp REAL,
            FOREIGN KEY(asset_id) REFERENCES assets(id)
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# --- MODELS ---
class Asset(BaseModel):
    id: str
    name: str
    type: str
    status: str
    fingerprint: str
    description: Optional[str]
    created_at: float

class Detection(BaseModel):
    id: str
    asset_id: str
    asset_name: str
    platform: str
    url: str
    match_score: float
    risk_level: str
    status: str
    view_count: int
    timestamp: float

# --- SIMULATION STATE ---
last_simulation_time = time.time()
monitoring_platforms = ["YouTube", "Twitter/X", "TikTok", "Telegram", "Instagram", "Reddit", "Discord", "Twitch"]

# --- API ENDPOINTS ---

@app.get("/api/stats")
async def get_stats():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM assets")
    asset_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM detections WHERE status = 'Pending'")
    active_pending = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM detections WHERE status = 'Takedown Issued'")
    takedowns = cursor.fetchone()[0]
    
    conn.close()
    
    return {
        "assets_protected": asset_count,
        "active_detections": active_pending,
        "takedowns_issued": takedowns,
        "roi_estimated": f"${(takedowns * 450) + random.randint(10, 500):,}",
        "scan_rate": f"{random.uniform(1.2, 1.5):.2f}M URLs/hr"
    }

@app.get("/api/assets", response_model=List[Asset])
async def get_assets():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM assets ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.post("/api/assets/enroll")
async def enroll_asset(name: str = Form(...), type: str = Form(...), file: UploadFile = File(None)):
    asset_id = str(uuid.uuid4())
    fingerprint = "phash_" + uuid.uuid4().hex[:12]
    description = "Awaiting AI Audit..."
    
    # --- REAL AI AUDIT (GEMINI) ---
    if model and file:
        try:
            # For a prototype, we just send the name to Gemini to "Audit" its legitimacy
            # In production, you'd send the actual video file/bytes
            prompt = f"Act as a Sports Media Auditor. Provide a 1-sentence technical description for a sports media asset named: {name}. Focus on its value and copyright sensitivity."
            response = model.generate_content(prompt)
            description = response.text.strip()
        except Exception as e:
            description = f"Audit Error: {str(e)}"
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO assets (id, name, type, status, fingerprint, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (asset_id, name, type, "Protected", fingerprint, description, time.time())
    )
    
    # Trigger an immediate detection to show the system is working
    det_id = str(uuid.uuid4())
    cursor.execute(
        "INSERT INTO detections (id, asset_id, asset_name, platform, url, match_score, risk_level, status, view_count, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (det_id, asset_id, name, random.choice(monitoring_platforms), f"https://pirate-portal.tv/v/{uuid.uuid4().hex[:6]}", round(random.uniform(92, 99.5), 2), "High", "Pending", random.randint(5, 100), time.time())
    )
    
    conn.commit()
    conn.close()
    
    return {"id": asset_id, "name": name, "status": "Protected"}

@app.get("/api/detections", response_model=List[Detection])
async def get_detections():
    global last_simulation_time
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Smart Simulation: Only generate detections if we have assets
    current_time = time.time()
    if current_time - last_simulation_time > 15:
        cursor.execute("SELECT id, name FROM assets")
        assets_list = cursor.fetchall()
        
        if assets_list:
            target = random.choice(assets_list)
            det_id = str(uuid.uuid4())
            cursor.execute(
                "INSERT INTO detections (id, asset_id, asset_name, platform, url, match_score, risk_level, status, view_count, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (det_id, target['id'], target['name'], random.choice(monitoring_platforms), f"https://stream-rip.io/match/{random.randint(1000, 9999)}", round(random.uniform(85, 99.9), 2), "High" if random.random() > 0.4 else "Medium", "Pending", random.randint(50, 5000), current_time)
            )
            conn.commit()
            last_simulation_time = current_time
    
    cursor.execute("SELECT * FROM detections ORDER BY timestamp DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.post("/api/detections/{detection_id}/takedown")
async def issue_takedown(detection_id: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("UPDATE detections SET status = 'Takedown Issued' WHERE id = ?", (detection_id,))
    if cursor.rowcount == 0:
        conn.close()
        return {"status": "error", "message": "Detection not found"}
    conn.commit()
    conn.close()
    return {"status": "success", "message": "DMCA notice issued."}

@app.get("/api/analytics/platforms")
async def platform_analytics():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT platform, COUNT(*) FROM detections GROUP BY platform")
    rows = cursor.fetchall()
    conn.close()
    return [{"name": row[0], "value": row[1]} for row in rows]

@app.get("/api/analytics/trends")
async def trend_analytics():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM detections")
    total = cursor.fetchone()[0]
    conn.close()
    
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    # Base numbers + current live data
    base = [45, 52, 38, 65, 48, 89, total]
    return [{"day": days[i], "detections": base[i] + random.randint(-2, 2), "takedowns": int(base[i]*0.8)} for i in range(7)]

if __name__ == "__main__":
    import uvicorn
    # Use environment variable PORT for cloud hosting (Render/Heroku/Google Cloud)
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
