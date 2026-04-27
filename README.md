# SportGuard AI
### Real-Time Sports Media Piracy Detection & Digital Asset Protection

**Google Solution Challenge 2026** | **Track: Digital Asset Protection**

SportGuard AI is a high-performance, AI-powered platform designed to protect official sports media assets from unauthorized redistribution. Using a combination of **Perceptual Hashing**, **Google Gemini AI**, and a distributed monitoring architecture, it identifies pirated content within seconds of it appearing online.

---

## 🚀 Key Features
- **AI Content Enrollment**: Generates unique, tamper-resistant "Digital DNA" for every official asset.
- **Gemini-Powered Audit**: Uses Google's Gemini 1.5 Flash to semantically analyze and verify media assets upon upload.
- **Real-Time Detection Network**: A simulated crawler network that mimics internet traffic across YouTube, Telegram, Discord, and more.
- **Automated Takedown Engine**: Single-click DMCA notice generation and automated platform reporting.
- **Strategic Intelligence Dashboard**: Real-time analytics on platform distribution, risk scoring, and ROI.

## 🛠️ Technology Stack
- **Frontend**: React.js, Vite, Recharts (Data Visualization), Framer Motion (Animations).
- **Backend**: FastAPI (Python), SQLite (Persistent Storage).
- **AI/ML**: Google Gemini API (Semantic Audit), ImageHash (Perceptual Fingerprinting).
- **Design**: Custom Vanilla CSS "Glassmorphism" Design System.

## 🏗️ Architecture (Proof of Concept)
While this is a local prototype, the architecture is designed for Google Cloud scaling:
- **Scalable Crawlers**: Designed to run as serverless microservices on **Google Cloud Run**.
- **Global Event Bus**: Detection alerts flow through **Google Cloud Pub/Sub**.
- **Big Data Analytics**: Analytics trend data is modeled after **Google BigQuery** real-time streams.

## 🏃 How to Run Locally

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
# (Optional) Add your Gemini API key to .env or main.py
python main.py
```

### 2. Frontend Setup
```bash
npm install
npm run dev
```

## 🎥 Competition Demo
1. **Enroll**: Upload a video clip. The system performs a "Gemini AI Audit" to identify the content.
2. **Detect**: The system immediately flags a "pirated" copy of the newly protected asset in the live feed.
3. **Takedown**: Issue a takedown and watch the "ROI" and "Success Rate" update in real-time on the Analytics dashboard.

---
*Built with ❤️ for the Google Solution Challenge 2026.*
