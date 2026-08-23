# ClearEase — Student Clearance Management System

A web-based system that helps students submit and monitor their school clearance online, replacing the traditional paper-based process with a centralized digital workflow.

## Overview

ClearEase provides a simple and organized way for students and school personnel to manage the clearance process. By replacing manual tracking with a centralized digital system, it aims to save time, reduce paperwork, and make clearance status easier to monitor.

## Tech Stack

- **Frontend:** Vue 3 (Composition API + `<script setup>`)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Backend / Database:** Supabase (Postgres, Auth, Row Level Security, Realtime, Storage)
- **State Management:** Pinia
- **Routing:** Vue Router
- **Forms & Validation:** VeeValidate + Zod
- **Charts:** Chart.js / ApexCharts (admin reports)
- **PDF Export:** jspdf / pdf-lib (printable clearance summary)

## User Roles

| Role | Description |
|---|---|
| **Student** | Registers/logs in, submits requirements, tracks clearance progress |
| **School Personnel** | Reviews, approves, or rejects requirements for their department, adds remarks |
| **Admin** | Manages requirements, accounts, monitors overview, generates reports, resets clearance records |

## Core Features

### Student
- Home dashboard with live status per subject/department
- Progress tracker (e.g. "8/10 requirements cleared")
- Remarks visible on rejected requirements
- Printable/downloadable clearance summary
- Real-time status notifications

### School Personnel
- View student requests for their department
- Review, approve, or reject requirements
- Add remarks to rejected items
- Search and filter requests by student

### Admin
- Manage requirements per department
- Manage user accounts
- Monitor clearance overview across all students
- Generate reports
- Reset clearance records per term

## Problems This Solves

- Reduces paperwork and manual tracking
- Gives students faster access to their clearance status
- Eliminates repeated in-person status inquiries
- Keeps student records organized and centralized
- Speeds up the approval process for personnel

## Project Structure

```
ClearEase/
├── backend/
│   └── supabase/
│       ├── .temp/
│       └── config.toml
└── frontend/
    └── hello/
        ├── .vscode/
        ├── dist/
        ├── node_modules/
        ├── public/
        ├── src/
        │   ├── assets/
        │   ├── components/
        │   ├── composables/
        │   ├── layouts/
        │   ├── pages/
        │   │   ├── student/
        │   │   ├── personnel/
        │   │   └── admin/
        │   ├── router/
        │   ├── stores/
        │   ├── types/
        │   ├── lib/
        │   │   └── supabase.ts
        │   ├── App.vue
        │   └── main.ts
        ├── .env
        ├── .gitignore
        ├── index.html
        ├── package.json
        ├── package-lock.json
        ├── README.md
        ├── tsconfig.json
        ├── tsconfig.app.json
        ├── tsconfig.node.json
        └── vite.config.ts
```

- **`backend/supabase`** — Supabase project config (`config.toml`), managed via the Supabase CLI. Migrations and edge functions live here once added.
- **`frontend/hello`** — The Vue 3 + TypeScript + Tailwind app (Vite-powered), currently scaffolded with the default Vite project name `hello`. Rename this folder when the app identity is finalized.

## Database Schema (Supabase / Postgres)

| Table | Purpose |
|---|---|
| `profiles` | Extends `auth.users` — name, student/employee ID, role, department |
| `departments` | Offices involved in clearance (Library, Guidance, Accounting, etc.) |
| `requirements` | Master list of clearance requirements per department |
| `clearance_periods` | Academic terms, used for resetting/archiving records |
| `clearance_requests` | Student-to-requirement status records (pending/approved/rejected) |
| `remarks` / `activity_log` | Audit trail of review actions |
| `notifications` | Status change alerts for students |

Row Level Security (RLS) policies restrict:
- Students to their own records
- Personnel to requests within their assigned department
- Admins to full access

## Getting Started

### Backend (Supabase)

```bash
cd backend/supabase

# Start local Supabase services (requires Supabase CLI + Docker)
supabase start

# Apply migrations
supabase db push
```

### Frontend (Vue app)

```bash
cd frontend/hello

# Install dependencies
npm install

# Set up environment variables
# Create a .env file with your Supabase URL and anon key

# Run the development server
npm run dev
```

## Environment Variables

`frontend/hello/.env`

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Roadmap

- [ ] Email notifications via Supabase Edge Functions
- [ ] QR code verification on printable clearance summary
- [ ] Admin audit log page
- [ ] Dark mode

## License

This project is developed for academic purposes.
