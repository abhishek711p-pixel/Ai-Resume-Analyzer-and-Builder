# ResuAI — AI-Powered ATS Builder & Optimizer

ResuAI is a premium, full-stack application designed to parse, analyze, score, and optimize resumes against specific Job Descriptions. Built with a modern dual-theme engine (Professional Mode & GenZ Neon Mode), the platform empowers candidates to align their applications directly with Applicant Tracking Systems (ATS).

---

## 🚀 Key Features

- **Solve the Problem (ATS Parsing & Matching):**
  - **Resume Import Engine:** Uses `pdf-parse` in the backend to extract text out of uploaded PDF resumes and convert them into strongly typed resume fields.
  - **Live ATS Match Scoring:** Sub-second programmatic analysis checking keyword density, action verbs, and readability metrics against job descriptions.
  - **Section Layout Shifter:** Dynamic layout order customizer allowing users to customize the sequence of resume blocks (Education, Experience, Projects, etc.).
- **Build Quality (Resilience & Responsive Layouts):**
  - **Zero-Dependency Dev DB Fallback:** Seamlessly connects to MongoDB Atlas, with an automated fallback to an isolated In-Memory server (`mongodb-memory-server`) if no local database server is detected.
  - **Protected Routing:** Strict routing guards (`ProtectedRoute`) protecting the workspace environment, preserving redirection state variables so users are returned to their work post-login.
  - **Dynamic Viewports:** Fully responsive drawer menu structures, navigation layouts, and view transitions.
- **Creative Thinking (Experience Upgrades):**
  - **Dual-Visual Themes:** Switch instantly between business-class **💼 Professional Mode** and neon cyberpunk **⚡ GenZ Mode**.
  - **AI Tech Stack Q&A Bot:** Fully integrated AI chat assistant in the footer to answer technical questions about the project's underlying frameworks and deployment patterns.
  - **Placement Guidance:** Highlights exactly what keywords are missing and contextually advises where to place them (e.g. Technical Skills, Operations, DevOps).
- **Clean Code & Structure:**
  - Written completely in **TypeScript** ensuring compile-time type safety.
  - Highly documented backend controllers, schema models, and frontend layouts.

---

## 🛠️ Tech Stack

- **Frontend:**
  - React 19 (Component Rendering)
  - TypeScript (Type Safety)
  - Vite 8 (Hot Module Replacement)
  - Framer Motion (Micro-animations and Page Transitions)
  - Lucide Icons (Sleek Iconography)
  - Custom CSS variables (Dynamic Theme Switching)
- **Backend:**
  - Node.js (Runtime)
  - Express.js v5 (Web API routing framework)
  - TypeScript (`tsx watch` watcher for zero-compilation restarts)
- **Database:**
  - MongoDB (Document Storage)
  - Mongoose (Object Data Modeling)
  - `mongodb-memory-server` (Isolated local test database fallback)
- **AI & Integrations:**
  - Groq SDK (`llama-3.1-8b-instant` for ultra-fast sub-second AI inference)
  - `pdf-parse` (Extracting text from PDF resume uploads)
  - JWT & BcryptJS (Secure token-based auth sessions and password hashing)

---

## 📂 Project Structure

```
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI Components (Navbar, Footer, Modals)
│   │   ├── context/        # Global Theme States (Pro vs GenZ Mode)
│   │   ├── pages/          # Workspace Pages (Builder, Tailor, Evaluation Hub)
│   │   ├── types/          # Strict TypeScript interface declarations
│   │   ├── utils/          # Resume parser and text enhancers
│   │   ├── App.tsx         # Route management and layout wrappers
│   │   └── index.css       # Custom HSL color variables and layout rules
│   └── package.json
│
└── server/                 # Express Backend
    ├── src/
    │   ├── config/         # DB configurations and Database Seeder
    │   ├── controllers/    # API Controllers (AI audits, authentication, CRUD)
    │   ├── middleware/     # JWT verification and route handlers
    │   ├── models/         # Mongoose schema declarations
    │   ├── routes/         # Express router mount points
    │   └── index.ts        # Main server configurations and initialization
    └── package.json
```

---

## 🏁 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 1. Setup Backend Server
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of the `server/` directory:
   ```env
   PORT=5001
   JWT_SECRET=supersecretjwtkey_resuai_2026
   GROQ_API_KEY=your_groq_api_key_here
   MONGO_URI=mongodb://127.0.0.1:27017/ai-resume  # Optional
   ```
4. Spin up the development backend server:
   ```bash
   npm run dev
   ```
   *Note: If no local MongoDB is running on port 27017, the server automatically starts an in-memory database fallback!*

### 2. Setup Frontend Client
1. Navigate to the client folder:
   ```bash
   cd ../client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Spin up the development frontend client:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## 🎓 Evaluator Sandbox Mode

To make project grading fast and painless:
1. When the backend database is first run empty, it automatically runs a **seeder script** that populates:
   - **Evaluator Sandbox Account:** `evaluator@pw.edu` (password: `password123`).
   - **Pre-populated Candidate Resume:** A complete multi-section resume for candidate **Abhishek Jain**.
2. Click on the **"Evaluation Hub"** button in the top navbar.
3. Review how the project matches the Builders Program grading metrics.
4. Click **"Launch Evaluator Demo Account"** to instantly sign into the test environment. You will be redirected straight to the workspace dashboard containing the pre-seeded candidate resume ready for ATS scanning, editing, or PDF exporting.
