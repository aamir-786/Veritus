# Veritus: Effective Risk Management Platform

Veritus is a comprehensive, modern Risk Management (GRC) educational platform and toolkit. Designed for executives and risk professionals, it offers actionable insights, masterclasses, and pre-built templates to streamline governance, risk, and compliance.

## 🌟 Key Features

- **Interactive Risk Matrix:** A beautifully designed heatmap allowing users to filter and explore 100 meticulously categorized risk questions based on Regulator Pressure, Payback Window, Cost Band, and Duration.
- **Premium Guidance & Playbooks:** Gated executive guidance, actionable step-by-step strategies, and regulatory playbooks accessible via secure authentication.
- **E-Commerce & Cart System:** Integrated Stripe checkout for purchasing premium Risk Masterclasses and Template Hub assets directly on the platform.
- **Robust Authentication:** Powered by Supabase, featuring secure Email/Password login, Google OAuth integration, and Role-Based Access Control (RBAC).
- **Admin Studio:** A powerful internal dashboard for administrators to manage user roles, edit risk questions, oversee template inventory, and track sales.
- **Automated Email Workflows:** Triggered executive-style email notifications for welcome onboarding, password resets, and purchase receipts.

## 🛠️ Technology Stack

**Frontend:**
- React (Vite)
- Tailwind CSS (Utility-first styling, Glassmorphism design system)
- React Router (Routing)
- Lucide React (Iconography)
- Stripe Elements (Payments)
- Supabase JS Client (Auth)

**Backend:**
- Node.js & Express.js
- Supabase (PostgreSQL Database, Row Level Security, Authentication)
- Stripe Node SDK (Payment Processing)
- Nodemailer (Transactional Emails)

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (v18+ recommended)
- A [Supabase](https://supabase.com/) account and project
- A [Stripe](https://stripe.com/) account (for testing payments)
- A Google Cloud Console project (optional, for Google OAuth)

### 1. Clone & Install Dependencies
The project is structured as a monorepo with separate `client` and `server` directories.

```bash
# Install root dependencies (concurrently)
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 2. Database Setup
1. Go to your Supabase Dashboard -> SQL Editor.
2. Copy the contents of `server/src/db/schema.sql` and run it to create the necessary tables, Row Level Security (RLS) policies, and triggers.

### 3. Environment Configuration

Create a `.env` file in the **client** directory (`client/.env`):
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Create a `.env` file in the **server** directory (`server/.env`):
```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
EMAIL_USER=your_email_address
EMAIL_PASS=your_app_password
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=server/config/google-service-account.json
```
*(Note: If using the Google API features, place your `google-service-account.json` inside `server/config/`)*

### 4. Run the Application

You can start both the frontend and backend simultaneously from the root directory:

```bash
# In the root directory
npm run dev
```

- Frontend will run on: `http://localhost:5173`
- Backend API will run on: `http://localhost:5000`

---

## 📖 How to Use

### For Users
1. **Explore the Matrix:** Navigate to the "100 Risk Questions" tab to browse questions. Click on any question to read the Executive Preview.
2. **Create an Account:** Click "Sign In" or "Get Access" to create an account via Email or Google OAuth. This unlocks the full 20,000+ words of guidance text and implementation steps.
3. **Purchase Templates:** Go to the "Template Hub", add desired compliance documents to your cart, and check out securely via Stripe.

### For Administrators
1. Register an account normally on the frontend.
2. Go to your Supabase Dashboard -> Table Editor -> `profiles`.
3. Change your user's `role` from `user` to `admin`.
4. Log out and log back in on the frontend.
5. You will now see the **Admin Studio** link in your user dropdown, giving you full CRUD access to the platform's database.

## 🚢 Production Deployment

- **Frontend:** Optimized for deployment on [Vercel](https://vercel.com). Ensure you add all `VITE_` variables to the Vercel Environment Variables settings. Make sure to add your Vercel URL to Supabase's Auth Redirect URLs.
- **Backend:** Optimized for deployment on [Render](https://render.com) or Heroku. Use Render's "Secret Files" feature to mount the `google-service-account.json` file securely to `/etc/secrets/`.

---

*Designed & Developed by the Veritus Team.*
