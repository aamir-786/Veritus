# Handover Pack — Veritus / Deciding in the Dark Platform

## 1. Architecture Note (Choices & Justifications)

| Layer | Selection | Rationale & Trade-Offs |
| :--- | :--- | :--- |
| **Frontend** | React (Vite) + Tailwind CSS | Fast bundle times, executive dark glassmorphism styling, clean component modularity. |
| **Backend** | Node.js + Express REST API | Lightweight REST layer for role-based JWT validation, content gating, and order processing. |
| **Database** | PostgreSQL / Supabase Model | Relational database schema optimized for 100 questions dataset with 7 taxonomy tags. |
| **Auth & Security** | Supabase Auth / JWT | Fail-closed access gating for paid courses, video streams, and downloadable templates. |
| **Payments** | Hosted Stripe Checkout | Non-negotiable compliance: zero credit card numbers ever touch platform servers. |

---

## 2. Step-by-Step Guide: Adding a New Subject / Course

1. **Log in to Admin Control Studio:**
   - Navigate to `/login` and sign in with `admin@veritus.com` / `admin123`.
2. **Access Admin Studio (`/admin`):**
   - Select the **Courses** tab.
   - Enter Course Title, Price ($ USD), Tier, and Summary Headline.
   - Click **Publish Course**.
3. **Add Curriculum Modules & Lessons:**
   - Select the newly created course from the dropdown.
   - Add Module Title (e.g. `Module 1: Executive Audit Preparation`).
   - Add Lesson Title, Type (`video`, `reading`, `document`), and Video URL / Content instructions.
4. **Instant Live Availability:**
   - Non-technical admins can add content without touching code or restarting servers.

---

## 3. Running Costs & Scalability Estimate

| Service | Initial Tier | Growth Scaling Trigger | Estimated Cost |
| :--- | :--- | :--- | :--- |
| **Supabase Hosted DB** | Free / Pro ($25/mo) | > 100,000 DB records | $25 – $100 / mo |
| **Vercel / Netlify Frontend** | Free Tier | > 100 GB Bandwidth | $20 / mo |
| **Backend Server (Render/Railway)** | Starter ($7/mo) | High API traffic | $7 – $25 / mo |
| **Stripe Processing** | Pay-as-you-go | 2.9% + $0.30 per transaction | Variable |

---

## 4. Known Shortcuts & Future 4-Week Roadmap

### Current Version (MVP Complete)
- Seeded in-memory / JSON database store with full relational capabilities and Supabase PostgreSQL integration endpoints.
- AI Risk Decision Copilot tailored for all 100 questions and organizational contexts.

### Future 4-Week Roadmap
- **Phase 2:** Automated certificate generation upon 100% course completion.
- **Phase 3:** Multi-author subscription splits and royalty distribution analytics.
- **Phase 4:** Live WebSocket in-app notification center for real-time regulator updates.
