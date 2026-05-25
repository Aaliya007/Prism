# ⬡ Prism: Autonomous Code Intelligence

Prism is an event-driven, multi-agent AI code review cockpit engineered to eliminate pull-request fatigue. By combining a client-side local heuristic analytics engine with specialized, parallel AI micro-agents, Prism translates raw git mutations into actionable architectural, performance, and security insights in seconds.

---

## 🚀 Key Features

* **Real-Time Event Interception:** Low-latency GitHub Webhooks hook directly into the DevOps lifecycle to automatically capture and analyze PR payloads the moment they are opened.
* **On-Demand Repo Sandbox:** Safely scan and audit any public repository context (like Kubernetes) on the fly without polluting background event queues.
* **Client-Side Local Heuristics:** A deterministic, zero-token-overhead evaluation layer that instantly scores code complexity baseline data entirely offline.
* **Parallel Multi-Agent Orchestration:** Side-steps slow serial prompt chains by spinning up concurrent specialized agents analyzing Security, Performance, and Maintainability simultaneously.
* **Interactive Code Review Panel:** Highly intuitive UI dashboard designed for seamless navigation, complete with context-aware code diff layouts and suggestion workflows.
* **Smart Suggestion Box Engine:** A multi-tiered review interface that intelligently triages code quality findings into structured, actionable feedback categories:
  * **Architectural & Process Rules:** High-level system-wide evaluations that ensure your pull requests align with organizational workflow baselines and pattern constraints.
  * **Line-Level Code Diffs:** Granular, contextual inline suggestions mapping out precise syntax enhancements directly against altered files.
  * **File-Specific Critical Fixes:** Immediate priority flags targeting complex file mutations, security vulnerabilities, or performance optimization requirements.
---

## 🛠️ Tech Stack

### Frontend
* **Core Framework:** React (built with Vite for lightning-fast bundling)
* **Styling & Theme UI:** Tailwind CSS & Custom design tokens 
* **State & Networking:** Client-side heuristic logic and integrated fetch pipelines

### Backend & DevOps
* **Server Architecture:** Express.js (Node.js runtime environment)
* **AI Pipelines:** Gemini 1.5 Flash API (multi-agent parallelization configuration)
* **Integrations:** GitHub REST API & Real-time Webhook listeners

---

## 📂 Project Structure

Prism uses a structured full-stack layout isolating our server architecture from the interactive dashboard workspace:

```text
prism/
├── backend/                  # Express.js Server Application
│   ├── config/               # Environment and API Initializations
│   │   ├── env.js
│   │   └── geminiModels.js
│   ├── lib/                  # Server-side Shared Utilities
│   ├── prompts/              # System Prompts for Specialized Agents
│   │   └── systemPrompt.js
│   ├── routes/               # API Route Handlers (Webhook Listeners & Sandbox)
│   ├── services/             # Core Logic Flow Handlers
│   │   ├── analyzePullRequest.js
│   │   └── runAIReview.js
│   ├── geminiServer.js       # Core Agent Orchestrator
│   ├── server.js             # Application Entry Point
│   └── .env                  # Backend Configuration File
│
├── public/                   # Static Visual Assets & Icons
│   ├── favicon.svg
│   └── icons.svg
│
├── src/                      # React Client Application
│   ├── assets/               # Media Components
│   ├── components/           # Reusable Modular UI Views
│   ├── lib/                  # Core Client-Side Utilities
│   │   ├── api.js            # Network Interaction Wrappers
│   │   ├── buildSuggestionsView.js
│   │   ├── formatRelativeTime.js
│   │   ├── integrations.js
│   │   └── mergeDecision.js  # Heuristic Logic Rules
│   ├── pages/                # High-Level Layout Views (Dashboard, Input)
│   ├── App.css
│   ├── App.jsx               # Client Routing Setup
│   ├── index.css
│   ├── main.jsx              # Vite UI Mounting Entry
│   └── prism-theme.css       # Core Dashboard Color Tokens
│
├── index.html                # Client Entry Template
├── vite.config.js            # Vite Environment Settings
└── package.json              # Main Project Manifest
```


## ⚙️ Installation and Setup

# ==========================================
# ⚙️ 1. CLONE & NAVIGATE TO PROJECT
# ==========================================
```text
git clone https://github.com/Aaliya007/Prism.git
cd Prism
```

# ==========================================
# ⚙️ 2. CONFIGURE ENVIRONMENT VARIABLES
# ==========================================
# Creating the .env inside the backend folder
```text
cat <<EOF > backend/.env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
GITHUB_TOKEN=your_github_personal_access_token_here
EOF
```

# ==========================================
# ⚙️ 3. INSTALL ALL DEPENDENCIES
# ==========================================
# Install root/client workspace dependencies
```text
npm install
```
# Navigate into backend and install server dependencies
```text
cd backend && npm install 
```

# ==========================================
# ⚙️ 4. RUNNING THE PROJECT LOCALLY
# ==========================================
# Open two separate terminal windows/tabs and run these:

# --- TERMINAL 1 (Start the Backend Server) ---
```text
cd backend && node server.js
```
# --- TERMINAL 2 (Start the Frontend Client) ---
# (Open a fresh terminal window back at the root directory)
```text
npm run dev
```

# ==============================================================================
# 🔮 PRISM FUTURE IMPROVEMENTS ROADMAP 
# ==============================================================================
# 1. Active Downstream Patch Execution:
#    Transitioning frontend actions into automated system writes using full-loop 
#    GitHub REST write permissions to automatically push user-approved diffs 
#    straight to origin branches.
#
# 2. Custom Security Rules:
#    Allowing developer workspaces to append local config files to supplement 
#    the heuristic engine parameters.
#
# 3. Deep Slack/Teams Integration:
#    Relaying critical warnings from the multi-agent queue straight to 
#    development communications streams instantly.
