from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import time
import random
import uuid
from pydantic import BaseModel
from typing import List, Optional
import imagehash
from PIL import Image
import io

app = FastAPI(title="SportGuard AI API")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock Databases
assets = []
detections = []
monitoring_platforms = ["YouTube", "Twitter/X", "TikTok", "Telegram", "Instagram", "Reddit", "Discord", "Twitch"]
last_simulation_time = time.time()

class Asset(BaseModel):
    id: str
    name: str
    type: str
    status: str
    fingerprint: str
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

# Initial Seed Data
@app.on_event("startup")
async def startup_event():
    # Add some mock assets
    asset_id = str(uuid.uuid4())
    assets.append({
        "id": asset_id,
        "name": "Champions League Final - Goal Highlight",
        "type": "Video",
        "status": "Protected",
        "fingerprint": "phash_8a2b3c4d5e6f",
        "created_at": time.time() - 86400
    })
    
    # Add some mock detections
    for i in range(5):
        detections.append({
            "id": str(uuid.uuid4()),
            "asset_id": asset_id,
            "asset_name": "Champions League Final - Goal Highlight",
            "platform": random.choice(monitoring_platforms),
            "url": f"https://{random.choice(['t.me', 'vimeo.com', 'streamable.com'])}/v/{random.randint(10000, 99999)}",
            "match_score": round(random.uniform(85, 99.9), 2),
            "risk_level": "High" if random.random() > 0.5 else "Medium",
            "status": "Pending",
            "view_count": random.randint(100, 50000),
            "timestamp": time.time() - random.randint(60, 3600)
        })

@app.get("/api/stats")
async def get_stats():
    # Simulate real-time growth and fluctuation
    active_pending = len([d for d in detections if d["status"] == "Pending"])
    takedowns = len([d for d in detections if d["status"] == "Takedown Issued"])
    return {
        "assets_protected": len(assets),
        "active_detections": active_pending,
        "takedowns_issued": takedowns,
        "roi_estimated": f"${(takedowns * 450) + random.randint(10, 500):,}",
        "scan_rate": f"{random.uniform(1.2, 1.5):.2f}M URLs/hr"
    }

@app.get("/api/assets", response_model=List[Asset])
async def get_assets():
    return assets

@app.post("/api/assets/enroll")
async def enroll_asset(name: str = Form(...), type: str = Form(...), file: UploadFile = File(None)):
    asset_id = str(uuid.uuid4())
    fingerprint = "phash_" + uuid.uuid4().hex[:12]
    new_asset = {
        "id": asset_id,
        "name": name,
        "type": type,
        "status": "Protected",
        "fingerprint": fingerprint,
        "created_at": time.time()
    }
    assets.append(new_asset)
    
    # Trigger an immediate "WOW" detection for the newly enrolled asset
    detections.append({
        "id": str(uuid.uuid4()),
        "asset_id": asset_id,
        "asset_name": name,
        "platform": random.choice(["Telegram", "YouTube", "Twitter/X"]),
        "url": f"https://piratesite.net/watch/{uuid.uuid4().hex[:8]}",
        "match_score": round(random.uniform(94, 99.8), 2),
        "risk_level": "High",
        "status": "Pending",
        "view_count": random.randint(10, 50),
        "timestamp": time.time()
    })
    
    return new_asset

@app.get("/api/detections", response_model=List[Detection])
async def get_detections():
    global last_simulation_time
    # Faster simulation: find new piracy clips every 8 seconds
    current_time = time.time()
    if current_time - last_simulation_time > 8 and assets:
        asset = random.choice(assets)
        new_det = {
            "id": str(uuid.uuid4()),
            "asset_id": asset["id"],
            "asset_name": asset["name"],
            "platform": random.choice(monitoring_platforms),
            "url": f"https://{random.choice(['t.me', 'vimeo.com', 'streamable.com', 'x.com'])}/v/{random.randint(100000, 999999)}",
            "match_score": round(random.uniform(88, 99.9), 2),
            "risk_level": "High" if random.random() > 0.4 else "Medium",
            "status": "Pending",
            "view_count": random.randint(50, 1000),
            "timestamp": current_time
        }
        detections.append(new_det)
        last_simulation_time = current_time
        
    return sorted(detections, key=lambda x: x["timestamp"], reverse=True)

@app.post("/api/detections/{detection_id}/takedown")
async def issue_takedown(detection_id: str):
    for d in detections:
        if d["id"] == detection_id:
            d["status"] = "Takedown Issued"
            return {"status": "success", "message": "DMCA notice generated and sent to platform."}
    return {"status": "error", "message": "Detection not found"}

@app.get("/api/analytics/platforms")
async def platform_analytics():
    stats = {}
    for d in detections:
        stats[d["platform"]] = stats.get(d["platform"], 0) + 1
    return [{"name": platform, "value": count} for platform, count in stats.items()]

@app.get("/api/analytics/trends")
async def trend_analytics():
    # Dynamic trend data based on current detection counts
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    base_detections = [45, 52, 38, 65, 48, 89, len(detections)]
    
    return [
        {
            "day": days[i], 
            "detections": base_detections[i] + random.randint(-2, 2), 
            "takedowns": int(base_detections[i] * 0.8) + random.randint(-1, 1)
        } for i in range(7)
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
