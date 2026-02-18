# Multilingual Client Leads Manager

## Problem Statement

Managing Multilingual Client Leads

## Solution Overview

This project proposes a practical and scalable solution developed entirely during the
8-hour ENKRYPTIA 2K26 Hackathon. The focus is on functionality, usability, and clarity
rather than overengineering.

## Tech Stack

- **Frontend:** Next.js 15 (App Router) + TypeScript + Material UI
- **Backend:** FastAPI (Python)
- **Authentication:** Firebase Auth
- **Database:** Supabase (PostgreSQL)
- **Deployment:** _(TBD)_

## Project Structure

```
hackathon/
├── backend/                 # FastAPI backend
│   ├── main.py              # API entry point (CORS + root endpoint)
│   ├── requirements.txt     # Python dependencies
│   ├── .env                 # Environment variables (not committed)
│   └── venv/                # Python virtual environment
│
├── frontend/                # Next.js frontend
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── services/        # API service functions
│   │   └── lib/             # Utilities & config (Firebase, etc.)
│   ├── .env.local           # Environment variables (not committed)
│   └── package.json         # Node.js dependencies
│
└── Readme.md
```

## Development Approach

- The project was started from scratch at the beginning of the hackathon.
- All development, testing, and documentation were completed within the official
  hackathon time window.
- Hourly commits were maintained to ensure transparent progress tracking.

## AI Assistance & Tools

AI tools were used strictly as development assistants for:

- Architecture planning
- Clean coding practices
- Frontend design consistency
- Debugging and testing guidance

No pre-built projects, templates, or external proprietary code were used.

## Features

- Feature 1
- Feature 2
- Feature 3

## Setup Instructions

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # macOS/Linux
pip install -r requirements.txt
cp .env.example .env            # Fill in your Supabase credentials
uvicorn main:app --reload
```

Backend runs at: `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local      # Fill in your Firebase credentials
npm run dev
```

Frontend runs at: `http://localhost:3000`

### Environment Variables

**Backend (`backend/.env`):**

| Variable       | Description              |
| -------------- | ------------------------ |
| `SUPABASE_URL` | Supabase project URL     |
| `SUPABASE_KEY` | Supabase anonymous key   |

**Frontend (`frontend/.env.local`):**

| Variable                                    | Description                |
| ------------------------------------------- | -------------------------- |
| `NEXT_PUBLIC_FIREBASE_API_KEY`              | Firebase API key           |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`          | Firebase auth domain       |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`           | Firebase project ID        |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`       | Firebase storage bucket    |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`  | Firebase messaging sender  |
| `NEXT_PUBLIC_FIREBASE_APP_ID`              | Firebase app ID            |
| `NEXT_PUBLIC_API_URL`                       | Backend API URL            |

## Demo

- Deployed Link / Screen Recording Link

## Team

- Member 1
- Member 2
- Member 3