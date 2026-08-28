# ClearEase — Student Clearance Management System

A web-based system that helps students submit and monitor their school clearance online, replacing the traditional paper-based process with a centralized digital workflow.

## Overview

ClearEase provides a simple and organized way for students and school personnel to manage the clearance process. By replacing manual tracking with a centralized digital system, it aims to save time, reduce paperwork, and make clearance status easier to monitor.

## Tech Stack

- **Frontend:** Vue 3 (Composition API + `<script setup>`)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Backend / Database:** Supabase (Postgres, Auth, Row Level Security, Realtime, Storage)
- **Routing:** Vue Router
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
└── frontend/
    └── hello/
        ├── public/
        ├── src/
        │   ├── assets/
        │   ├── components/
        │   │   ├── Dashboard.vue
        │   │   ├── Login.vue
        │   │   └── Sidebar.vue
        │   ├── lib/
        │   │   └── supabase.ts
        │   ├── types/
        │   ├── App.vue
        │   ├── main.ts
        │   └── style.css
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

- **`frontend/hello`** — The Vue 3 + TypeScript + Tailwind app powered by Vite.
- **`src/components`** — Reusable Vue components for the dashboard, sidebar, and login form.
- **`src/lib/supabase.ts`** — Shared Supabase client configured through environment variables.
- **`src/types`** — TypeScript type definitions used by the application.
- **`dist`** and **`node_modules`** are generated locally and should not be committed.
- Supabase backend configuration, migrations, and Edge Functions are not currently included in this workspace.

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

The Supabase backend is currently managed through the Supabase dashboard. Local Supabase configuration, migrations, and Edge Functions have not yet been added to this workspace.

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

### Git Collaboration Workflow

Use a separate branch for project integration and feature work. Avoid pushing directly to `main` so changes can be reviewed and tested before they are merged.

#### Clone a repository

```bash
cd path/to/ClearEase
git clone <repository-url> other-project
cd other-project
npm install
```

#### Create a working branch

```bash
git switch -c integrate-other-project
```

Make and test your changes, then commit and push the branch:

```bash
git add .
git commit -m "Merge project changes"
npm run build
git push -u origin integrate-other-project
```

Create a pull request from `integrate-other-project` into `main` after the build succeeds.

#### Merge another repository into this project

From the existing project directory:

```bash
cd frontend/hello
git status
git add .
git commit -m "Save current ClearEase work"
git switch -c integrate-other-project
git remote add other <repository-url>
git fetch other
git merge other/main
```

If Git reports conflicts, edit the marked files, then run:

```bash
git status
git add <resolved-file>
git commit
npm install
npm run build
git push -u origin integrate-other-project
```

Keep `.env` files out of Git. They contain Supabase configuration and should never be committed. The Supabase publishable/anon key may be used in the frontend, but service-role keys must remain private.

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
