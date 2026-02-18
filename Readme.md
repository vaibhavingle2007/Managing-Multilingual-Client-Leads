# 🌍 Multilingual Client Leads Manager

> **ENKRYPTIA 2K26 Hackathon Project**
> A scalable solution for managing multilingual client leads with AI-powered translation and real-time communication.

---

## 🚀 Live Demo

| Component | URL | Status |
| :--- | :--- | :--- |
| **Frontend** | [https://frontend-gamma-five-83.vercel.app](https://frontend-gamma-five-83.vercel.app) | 🟢 Live |
|   **Dashboard**           |[https://frontend-gamma-five-83.vercel.app](https://frontend-gamma-five-83.vercel.app/dashboard) | 🟢 Live |
| **Backend API** | [https://backend-psi-five-44.vercel.app/docs](https://backend-psi-five-44.vercel.app/docs) | 🟢 Live |

---

## 📖 Problem Statement

Global businesses face a communication barrier when dealing with leads who speak different languages. This project bridges that gap by enabling seamless, bi-directional communication between clients and agents, regardless of their native language.

## ✨ Key Features

### **1. 🌍 Multilingual AI Engine**
*   **Smart Language Detection:** Automatically detects the client's browser language.
*   **Bi-Directional Translation (Gemini AI):**
    *   **Client → Agent:** Translates non-English lead inquiries into English for agents.
    *   **Agent → Client:** Automatically translates agent replies **back into the client's native language**.
*   **Original & Translated View:** Stores both versions of every message to ensure context accuracy.

### **2. 🔐 Authentication & Security**
*   **Firebase Authentication:** Secure login via **Google Sign-In** and **Email/Password**.
*   **Role-Based Access Control (RBAC):**
    *   **Clients:** Access to Submission Portal (`/submit`).
    *   **Agents:** Access to Admin Dashboard (`/dashboard`).
*   **Protected Routes:** Guards prevent unauthorized access.

### **3. 📝 Client Experience**
*   **Premium Lead Portal:**
    *   Glassmorphism UI with a sticky sidebar form.
    *   Real-time form validation.
    *   **"My Submissions" Feed:** Clients track their lead status (New, Contacted, Won) live.
*   **Instant Replies:** Clients see agent responses instantly, auto-translated to their language.

### **4. 📊 Agent Dashboard**
*   **Lead Management:** Grid view with filtering by Status and Language.
*   **Communication Hub:**
    *   **Expandable Rows:** View full conversation history.
    *   **Reply System:** Type in English → Sends in Client's Language.
    *   **Visual Confidence:** Flags indicate the client's region (e.g., 🇸🇦 Arabic, 🇫🇷 French).

### **5. 📨 Notification System**
*   **Email Alerts:** Clients receive email notifications when agents reply (via SMTP).
*   **Real-time Updates:** Auto-refreshing dashboards (swr/polling).

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Material UI, Glassmorphism CSS.
- **Backend:** FastAPI (Python), Pydantic.
- **AI Engine:** Google Gemini Pro (Translation & Detection).
- **Database:** Supabase (PostgreSQL) with Row Level Security.
- **Authentication:** Firebase Auth (Google + Email/Pass).
- **Deployment:** Vercel (Frontend & Backend Serverless).

---

## 📂 Project Structure

```
hackathon/
├── backend/                 # FastAPI backend
│   ├── main.py              # API entry point
│   ├── services/            # Logic for Gemini, Supabase, SMTP
│   ├── migrations/          # SQL scripts for database setup
│   ├── vercel.json          # Deployment config
│   └── requirements.txt     # Python dependencies
│
├── frontend/                # Next.js frontend
│   ├── src/app/             # Pages: /submit, /dashboard, /login
│   ├── src/components/      # UI Components
│   ├── src/services/        # API integration
│   └── src/contexts/        # Auth Context Provider
│
└── README.md
```

## ⚙️ Local Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+

### 1. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # macOS/Linux
# .\venv\Scripts\activate      # Windows
pip install -r requirements.txt

# Create .env file with:
# SUPABASE_URL=...
# SUPABASE_KEY=...
# GEMINI_API_KEY=...

uvicorn main:app --reload
```
Runs at: `http://localhost:8000`

### 2. Frontend Setup
```bash
cd frontend
npm install

# Create .env.local file with:
# NEXT_PUBLIC_FIREBASE_Config...
# NEXT_PUBLIC_API_URL=http://localhost:8000

npm run dev
```
Runs at: `http://localhost:3000`

---

## 👥 Team

- Vaibhav Ingle
- Vedang Lambat
- Siddhesh Athavale
- Sameer Yadav
