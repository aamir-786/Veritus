# Veritus Executive Risk Platform

> **Deciding in the Dark — The Premier Enterprise Risk Management (GRC) Educational Platform & Executive Toolkit.**

Veritus is a modern, high-performance Risk Management (GRC) platform engineered for C-suite executives, Chief Risk Officers (CROs), board members, and risk practitioners. It combines interactive risk taxonomy playbooks, executive masterclasses, digital compliance templates, verified certificate credentialing, and an intuitive Admin Studio.

---

## 🌟 Key System Capabilities

### 1. Interactive 100 Risk Questions Taxonomy Matrix
- **Dynamic Heatmap & Filters**: Filter 100 risk governance questions by **Regulator Pressure** (*High, Moderate, Low*), **Payback Window**, **Cost Band**, and **Duration**.
- **Actionable Playbooks**: Gated executive guidance, regulatory compliance steps, and decision framework playbooks.

### 2. Executive Risk Masterclasses & Course Player
- **Interactive Modules**: Multi-lesson masterclasses with rich text, video streams, audio playbooks, and interactive assessment quizzes.
- **Progress Tracking**: Real-time progress percentage computation and resumption to the last active lesson.

### 3. Executive Certificate Credentialing & LinkedIn Integration
- **Legal Name Verification & Permanent Locking**: Pre-issuance `NameConfirmationModal` prompts students to verify their official legal name. Once generated, recipient names are permanently locked (`POST /api/dashboard/certificates/issue`) so subsequent profile name changes do not alter issued certificates.
- **1-Click "Add to LinkedIn"**: Official LinkedIn certification integration pre-filling `certId` (e.g. `#1452`), `name`, `organizationName`, `issueYear`, `issueMonth`, and `certUrl`.

### 4. Admin Studio (Comprehensive Admin Management Suite)
- **Real-Time Analytics**: Track platform revenue, user registrations, course completions, and inquiries.
- **User Management & Account Editor**: Edit practitioner **Full Name**, **Email Address**, **Password**, and **Account Role** (*Student* vs *Administrator*) directly with real-time database upserting.
- **Masterclass & Module Builder**: Build courses, add modules, upload video/audio URLs, and create assessment questions.
- **Taxonomy Manager**: Full CRUD control over the 100 Risk Questions matrix.
- **Global Promotions & Coupon Manager**: Create site-wide discount codes, expiration dates, custom banner messages, and enable dynamic 1-click clipboard copying.
- **Reviews & Testimonial Engine**: Single-review policy automatically suppresses review buttons after submission; reviews are displayed with categorized product badges (**Masterclass**, **Taxonomy Question**, **Digital Template**) and feedback tag pills.

---

## 🛠️ System Architecture & Technology Stack

```
   ┌─────────────────────────────────────────────────────────┐
   │                    Client (Vite + React)                │
   │  TailwindCSS • Lucide Icons • Stripe Elements • Context │
   └────────────────────────────┬────────────────────────────┘
                                │ HTTPS / REST API
   ┌────────────────────────────▼────────────────────────────┐
   │                Backend (Express.js Node.js)             │
   │  JWT / Bearer Auth • Route Aliases (/api & /api/v1)      │
   └────────────────────────────┬────────────────────────────┘
                                │ Supabase JS Client & Admin SDK
   ┌────────────────────────────▼────────────────────────────┐
   │               Supabase (PostgreSQL Database)            │
   │  Profiles • Courses • Progress • Certificates • Reviews │
   └─────────────────────────────────────────────────────────┘
```

- **Frontend**: React (Vite), TailwindCSS, React Router, Lucide Icons, Helmet Async, Vitest.
- **Backend**: Node.js, Express.js, Supabase Admin SDK, PostgREST API, CORS.
- **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS) policies and JWT authentication.

---

## 🔒 `.gitignore` Specification & Security Maintenance

The repository uses a strict `.gitignore` policy to prevent sensitive environment keys, IDE configurations, temporary scratch files, and build artifacts from entering version control.

### Included `.gitignore` Rules:

```gitignore
# Dependencies
node_modules/
.pnpm-store

# Production Builds
client/dist
dist/
build/

# Environment Configuration (Security sensitive)
.env
server/.env
client/.env
*.env.local

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# System & IDE Files
.DS_Store
Thumbs.db
.vscode/
.idea/

# Secrets & Config
server/config/google-service-account.json
server/config/*.json

# Scratch & Temp
scratch/
*.tmp
*.bak
```

### Instructions for Managing Ignored Files:
1. **Never Commit Secrets**: Do NOT remove `.env` or `server/config/*.json` from `.gitignore`. Secret keys (`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`) must remain local or in deployment platform environment variables.
2. **Local `.env` Creation**: Always create local `.env` files based on `.env.example` templates.
3. **Temporary Scratch Work**: Place temporary debug scripts, scratch data, or trial export files inside the `scratch/` folder or root `*.tmp` files—they are automatically ignored by git.
4. **IDE Configurations**: `.vscode/` and `.idea/` folders are ignored so personal workspace settings do not clutter repository commits.

---

## 🚀 Getting Started (Local Setup)

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **Git**: Installed locally
- **Supabase Account**: A Supabase project with database schema applied

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/aamir-786/Veritus.git
cd Veritus

# Install root dependencies
npm install

# Install client dependencies
npm install --prefix client

# Install server dependencies
npm install --prefix server
```

### 3. Environment Variable Configuration

Create `client/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Create `server/.env`:
```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
STRIPE_SECRET_KEY=sk_test_your_key
```

### 4. Running the Development Server
```bash
# Start both client and server concurrently
npm run dev
```
- **Frontend URL**: `http://localhost:5173`
- **Backend API URL**: `http://localhost:5000` (supports `/api/v1` and `/api` routes)

### 5. Running Tests & Production Builds
```bash
# Run Vitest unit tests
npm test --prefix client

# Run Vite production build
npm run build --prefix client
```

---

## 📖 Admin Studio Access

To grant an account Administrator privileges:
1. Register a standard user account on the frontend.
2. Run the admin seed script or update `public.profiles` role in Supabase:
   ```bash
   node seed_admin.js admin@veritus.com
   ```
3. Log in with the admin account to access **Admin Studio** (`/admin`).

---

## 🚢 Production Deployment

- **Frontend (Vercel)**:
  - Connect repository root to Vercel.
  - Set `VITE_API_BASE_URL` to `https://your-render-app.onrender.com/api/v1`.
  - Configure `vercel.json` rewrites for SPA routing.

- **Backend (Render)**:
  - Deploy as a Node Web Service using start command `node server/src/server.js`.
  - Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to Render environment variables.

---

*Documentation updated for Veritus Executive Risk Platform.*
