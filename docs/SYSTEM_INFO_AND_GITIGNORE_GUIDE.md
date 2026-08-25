# Veritus Platform — System Information & GitIgnore Architectural Guide

> **Official Documentation for Developers, Administrators, and DevOps.**

---

## 1. System Overview & Monorepo Structure

The Veritus platform consists of a React (Vite) frontend application and an Express (Node.js) REST API backend connected to a Supabase PostgreSQL database.

```
Veritus2/
├── client/                      # Frontend Application (React + Vite + TailwindCSS)
│   ├── src/
│   │   ├── components/          # UI Modals, Banners, Navbars, Footers
│   │   ├── context/             # AuthContext & CartContext
│   │   ├── pages/               # Dashboard, AdminStudio, Certificate, Home, etc.
│   │   └── services/api.js      # REST API Client Service Layer
│   ├── public/                  # Static images & favicons
│   └── package.json
├── server/                      # Backend API Application (Express.js)
│   ├── src/
│   │   ├── config/              # Supabase Client Configuration
│   │   ├── controllers/         # Auth, Admin, Dashboard, Courses, Reviews Controllers
│   │   ├── middleware/          # JWT Authentication & Admin Guards
│   │   ├── routes/api.js        # Main API Route Handler
│   │   └── server.js            # Express Entry Point & Dual Route Mounting (/api & /api/v1)
│   └── package.json
├── docs/                        # Technical Documentation & Handover Guides
├── .gitignore                   # Version Control Suppression Rules
├── package.json                 # Monorepo Concurrently Scripts
└── seed_admin.js                # Administrator Privileges Seeding Script
```

---

## 2. Comprehensive Database Schema (`public` schema)

| Table Name | Primary Purpose | Key Columns |
| :--- | :--- | :--- |
| `profiles` | User profile & role tracking | `id` (FK auth.users), `email`, `full_name`, `role` (`student`/`admin`) |
| `courses` | Masterclasses & Playbooks | `id`, `slug`, `title`, `headline`, `description`, `tier`, `price`, `published` |
| `modules` | Course Modules | `id`, `course_id`, `title`, `sequence_order` |
| `lessons` | Course Lessons | `id`, `module_id`, `title`, `content_blocks`, `video_url`, `audio_url` |
| `progress` | Lesson Completion Progress | `id`, `user_id`, `course_id`, `lesson_id`, `completed`, `updated_at` |
| `certificates` | Permanent Verified Certificates | `id`, `user_id`, `course_id`, `course_title`, `student_name`, `cert_number`, `issued_at` |
| `templates` | Digital Frameworks & Downloads | `id`, `title`, `description`, `category`, `file_path`, `is_free`, `price`, `downloads_count` |
| `questions` | 100 Risk Taxonomy Questions | `id`, `question_number`, `title`, `domain`, `regulator_pressure`, `payback_window`, `cost_band`, `duration` |
| `promotions` | Discount Coupons & Banners | `id`, `promo_code`, `discount_percentage`, `banner_message`, `show_banner`, `start_date`, `end_date` |
| `reviews` | User Feedback & Ratings | `id`, `user_id`, `product_type` (`course`/`question`/`template`), `product_id`, `rating`, `comment`, `is_featured` |

---

## 3. Complete API Endpoint Catalog

### Authentication & Profile Routes
- `GET /api/v1/auth/profile` — Fetch current user profile.
- `PUT /api/v1/auth/profile` — Update user full name across `public.profiles` and Supabase Auth.
- `POST /api/v1/auth/welcome` — Send onboarding welcome email.

### Dashboard & Learning Routes
- `GET /api/v1/dashboard/summary` — Fetch enrolled courses, template access, progress metrics.
- `POST /api/v1/dashboard/progress` — Record lesson completion progress.
- `GET /api/v1/dashboard/certificates` — Fetch earned certificates with locked recipient names.
- `POST /api/v1/dashboard/certificates/issue` — Issue and permanently lock legal recipient name on certificate.
- `GET /api/v1/dashboard/certificates/:courseId` — Fetch single certificate details.

### Public & Review Routes
- `GET /api/v1/courses` — List published masterclasses.
- `GET /api/v1/courses/:identifier` — Detailed course syllabus and reviews.
- `GET /api/v1/templates` — List template store assets.
- `GET /api/v1/promotions/active` — Fetch current active promotional banner and coupon code.
- `GET /api/v1/reviews/landing` — Fetch featured user testimonials.
- `POST /api/v1/reviews` — Submit product review (enforces single-review policy).

### Admin Studio Routes (Protected: Admin Only)
- `GET /api/v1/admin/metrics` — Dashboard summary metrics and user list.
- `PUT /api/v1/admin/users/:id` — Edit user **Name**, **Email**, **Password**, and **Role**.
- `DELETE /api/v1/admin/users/:id` — Delete user account.
- `POST /api/v1/admin/courses` — Create new masterclass.
- `PUT /api/v1/admin/questions/:id` — Update taxonomy question.
- `POST /api/v1/admin/promotions` — Create global promotion banner & coupon code.
- `PUT /api/v1/admin/reviews/:id/featured` — Toggle review featured state on landing page.

---

## 4. Comprehensive `.gitignore` Guide & Maintenance

### `.gitignore` File Structure:
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

### Why Each Item is Ignored:

1. **`node_modules/`**: Contains thousands of installed npm package binaries. Rebuilt cleanly via `npm install`.
2. **`client/dist` & `dist/`**: Compiled distribution bundles produced by `npm run build`. Never commit build assets to source control.
3. **`.env`, `server/.env`, `client/.env`**: Contains sensitive API keys, secret database tokens (`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`). Committing these risks secret leaks!
4. **`.vscode/` & `.idea/`**: Local IDE workspace settings, window state, and personal editor extensions. Keeping them ignored prevents repository noise.
5. **`scratch/`, `*.tmp`, `*.bak`**: Scratch scripts, local SQL exports, or temporary trial files.

---

## 5. Security & Protection Policies

1. **Row Level Security (RLS)**: PostgreSQL tables use Supabase RLS policies ensuring users can only read/write their own progress and certificates.
2. **Immutable Certificates**: Certificate recipient names are locked upon issuance via `issueCertificate` API and cannot be mutated by profile updates.
3. **Single Review Enforcement**: Backend `reviewsController.js` enforces one review per product per user (`product_type`, `product_id`, `user_id`).

---

*Documentation maintained by Veritus Executive Engineering Team.*
