# SmartSumm AI 🌌

SmartSumm AI is a production-ready, SaaS-like, premium AI-powered content summarizer. It is designed to help professionals, researchers, students, and businesses quickly digest dense textbooks, academic articles, long-form PDFs, DOCX documents, and plain text files. 

The application offers a modern, high-contrast Slate-and-Indigo glassmorphic layout, customizable lengths, instant execution logging, direct high-quality PDF exporting, and a context-aware AI conversational companion to answer downstream questions about the summaries.

---

## ⚡ Core Summarization Modes

SmartSumm AI provides **two distinct summarization paradigms** tailored to different levels of factual strictness:

### 1. Exact Content Summary (Verbatim Extractive)
*   **UI Designation:** `Exact Content Summary`
*   **Aesthetic Flag:** 🟢 Emerald Accent with Check Shield icon.
*   **Core Goal:** 100% factual accuracy. Zero hallucination. Zero generated sentences.
*   **How it Works:** Runs a custom local Node-based TF-IDF / sentence term frequency score ranker with square-root length normalization. It tokenizes the document, scores individual sentences against the global word frequency matrix (excluding English stopwords), filters the highest density nodes, and extracts the sentences verbatim.
*   **Narrative Flow:** Extracted sentences are automatically sorted back into their *original order of appearance* to maintain natural reading context.
*   **Output Format:** Formatted as copyable bullet-points.

### 2. Smart AI Summary (Generative Abstractive)
*   **UI Designation:** `Smart AI Summary`
*   **Aesthetic Flag:** 🟣 Neon Violet Accent with Brain/AI icon.
*   **Core Goal:** Beginner-friendly explanation. Deep conceptual synthesis.
*   **How it Works:** Integrates with the Google Gemini API (`gemini-1.5-flash`) using strict instructions to digest dense content, translate academic/business jargons into simple words, formulate analogies, and explain the core ideas clearly in a conversational tone.
*   **Output Format:** Formatted as Markdown paragraphs and headers.

---

## 🛠️ Technology Stack

### Frontend (`client/`)
*   **Framework:** React (Vite environment)
*   **Styling:** Tailwind CSS (Dark Mode-first, Slate-950 obsidian background, Indigo/Violet branding)
*   **Animations:** Framer Motion (hover states, modal overlays, slide drawers)
*   **Icons:** Lucide React
*   **Effects:** Canvas Confetti (Micro-success trigger upon summary generation)
*   **HTTP Client:** Axios (featuring request interceptors to automatically append JWT tokens)
*   **Routing:** React Router DOM (v6)

### Backend (`server/`)
*   **Runtime:** Node.js + Express.js
*   **ES Modules:** Native `"type": "module"` configurations
*   **Database:** MongoDB Atlas + Mongoose ODM
*   **Security:** JSON Web Tokens (JWT) + salt-hashed passwords using `bcryptjs`
*   **Upload Processing:** Multer (in-memory buffer parsing)
*   **Document Parsers:** 
    *   `pdf-parse` (PDF text extractors)
    *   `mammoth` (DOCX raw text compiler)
*   **AI Integration:** `@google/generative-ai` SDK (Google Gemini 1.5 Flash)

---

## 📂 Project Architecture

```
AI_bot_summarize/
├── client/                     # React Frontend (Vite)
│   ├── public/                 # Static Assets
│   ├── src/
│   │   ├── components/
│   │   │   └── Sidebar.jsx     # Navigation sidebar (collapsible on mobile, theme switches)
│   │   ├── context/
│   │   │   └── AuthContext.jsx # JWT, auth states, local storage & theme coordinator
│   │   ├── pages/
│   │   │   ├── Landing.jsx     # SaaS-style introduction and mode comparison cards
│   │   │   ├── Login.jsx       # Glassmorphic auth entry with validations
│   │   │   ├── Register.jsx    # User signup page
│   │   │   ├── Dashboard.jsx   # Input workspace, cards selector, results, PDF downloader, AI Chat
│   │   │   └── History.jsx     # Log search grids, detail drawers, inline chat resume, deleting
│   │   ├── utils/
│   │   │   └── api.js          # Centred Axios client with Bearer Token interceptors
│   │   ├── App.css             # Cleared defaults
│   │   ├── App.jsx             # Route guards and URL declarations
│   │   ├── index.css           # Global custom scrollbars, orbs, and glass classes
│   │   └── main.jsx            # DOM mounting entry
│   ├── package.json
│   ├── tailwind.config.js      # Theme extensions, palettes and sliding animations
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── vercel.json             # Vercel SPA routing redirects
│
└── server/                     # Express Backend
    ├── src/
    │   ├── config/
    │   │   └── db.js           # Mongoose Atlas connection manager
    │   ├── middleware/
    │   │   └── auth.js         # JWT header validator
    │   ├── models/
    │   │   ├── User.js         # Relational credentials schema with salting hooks
    │   │   └── Summary.js      # Relational summaries schema containing nested chat logs
    │   ├── routes/
    │   │   ├── auth.js         # Register, Login, Me endpoints
    │   │   ├── summarize.js    # Direct text summaries, file buffers processing, chat triggers
    │   │   └── history.js      # User summary records loaders and deleters
    │   ├── utils/
    │   │   ├── extractive.js   # Custom local NLP sentencizer and term scorer
    │   │   ├── ai.js           # Gemini API summarizing instructions and chatbot queries
    │   │   └── fileParser.js   # In-memory pdf-parse and mammoth converters
    │   └── index.js            # Main gateway bootstrap file
    ├── package.json
    ├── .env.example            # Environment variables guideline
    └── vercel.json             # Vercel Serverless Function routers
```

---

## ⚙️ Environment Configurations

### Server Environment Variables (`server/.env`)
Create a `.env` file inside the `server/` directory and configure the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_jwt_session_token_key_string
GEMINI_API_KEY=your_google_gemini_api_key
NODE_ENV=development
```

> **Note:** If `GEMINI_API_KEY` is not present, the backend gracefully fallbacks into **Demo Fallback Mode**, presenting an informative prompt inside the dashboard so developers can test layouts immediately without API restrictions.

### Client Environment Variables (`client/.env`)
In local development, the client defaults to sending requests to `http://localhost:5000/api`. If deploying, you can create a `.env` inside the `client/` folder:

```env
VITE_API_URL=https://your-backend-vercel-url.vercel.app/api
```

---

## 🚀 Installation & Local Launch

### Prerequisites
*   Node.js (v18 or higher recommended)
*   npm or yarn
*   A MongoDB Atlas database instance

### Step 1: Clone and setup the Server
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install server dependencies:
   ```bash
   npm install
   ```
3. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
4. Insert your MongoDB Atlas URL and Gemini API Key inside `.env`.
5. Launch the local API server:
   ```bash
   npm start
   ```
   *The console should output: `MongoDB Connected` and `SmartSumm AI Server is active... on port 5000`*

### Step 2: Setup the Client
1. Open a new terminal window and navigate to the client folder:
   ```bash
   cd client
   ```
2. Install client dependencies utilizing peer-dependencies bypass (required for modern React 19 package tree adjustments):
   ```bash
   npm install --legacy-peer-deps
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## 📡 API Specification Documentation

### 🔓 Authentication Routes
*   `POST /api/auth/register` (Register new user account)
    *   *Input:* `{ "name": "...", "email": "...", "password": "..." }`
    *   *Output:* `{ "success": true, "token": "...", "user": { "id": "...", "name": "...", "email": "..." } }`
*   `POST /api/auth/login` (Authenticate user credentials)
    *   *Input:* `{ "email": "...", "password": "..." }`
    *   *Output:* `{ "success": true, "token": "...", "user": { ... } }`
*   `GET /api/auth/me` (Protected: get verified profile session)

### 📝 Summarization Routes (Protected)
*   `POST /api/summarize/text` (Summarize raw text inputs)
    *   *Input:* `{ "content": "Long text...", "summaryType": "extractive|abstractive", "summaryLength": "short|medium|detailed" }`
    *   *Output:* `{ "success": true, "summaryType": "...", "summary": "...", "wordCount": 120, "processingTime": "1.3s", "id": "..." }`
*   `POST /api/summarize/file` (Protected: upload a file and summarize)
    *   *Headers:* `Content-Type: multipart/form-data`
    *   *Body params:* `file` (Binary buffer PDF/DOCX), `summaryType` (extractive|abstractive), `summaryLength` (short|medium|detailed)
    *   *Output:* `{ "success": true, "summaryType": "...", "summary": "...", "wordCount": 240, "processingTime": "2.2s", "id": "..." }`
*   `POST /api/summarize/:id/chat` (Protected: downstream follow-up conversational dialogue)
    *   *Input:* `{ "message": "Can you simplify this further?" }`
    *   *Output:* `{ "success": true, "userMessage": "...", "aiResponse": "...", "chatHistory": [ { "role": "user|model", "content": "..." } ] }`

### 📂 History Routes (Protected)
*   `GET /api/history` (Get summary log grid list, omitting original content to reduce network overhead)
*   `GET /api/history/:id` (Get detailed summary logs including complete chat dialogue logs)
*   `DELETE /api/history/:id` (Delete summary archive log permanently)

---

## 🌐 Production Deployment Guide (Vercel)

Both frontend and backend are fully optimized for seamless **Vercel** serverless hosting:

### Backend Deployment (`server/`)
1. Make sure `vercel.json` is configured in the server root.
2. In the server directory, run the Vercel CLI command:
   ```bash
   vercel
   ```
3. Set your production Environment Variables on the Vercel Dashboard:
   *   `MONGODB_URI`
   *   `JWT_SECRET`
   *   `GEMINI_API_KEY`
   *   `NODE_ENV=production`

### Frontend Deployment (`client/`)
1. Create a `client/.env` file and set `VITE_API_URL` to your newly deployed Vercel backend URL (e.g. `https://smartsumm-api.vercel.app/api`).
2. Inside the client folder, execute:
   ```bash
   vercel --prod
   ```
3. The routing rewrites in `client/vercel.json` will ensure React Router URL deep linking resolves without 404 errors.

---

## 💎 Premium UX Features Implemented
*   **Glassmorphism styling tokens:** Fine-tuned opacity backgrounds (`backdrop-blur`) that present glowing reflections on slate-black.
*   **Ambient Glow:** Embedded absolute neon gradient circles that follow theme toggles.
*   **Vector PDF rendering:** The PDF export opens a sandbox printing session styled for print pages, rendering text vectors sharply and preserving custom margins.
*   **Dialog History Resume:** Closing a detailed summary doesn't wipe history context. Opening a summary from history retrieves logs and resumes chats natively.
*   **Progressive steps indicators:** Summarizing runs a timing-bound status reporter ("Extracting channels...", "Formatting matrix...") to soothe wait times.
*   **Canvas Success confetti:** Explodes on screen when summaries are loaded, offering high user delight.
