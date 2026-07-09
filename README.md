<div align="center">

<img src="public/logo.png" alt="LeadHive" width="220"/>

# LeadHive

**A modern, role-based CRM for managing sales leads, teams, and performance — built for call-center-style sales pipelines.**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![React Router](https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![License](https://img.shields.io/badge/status-demo-blueviolet)]()

*This repository is a client-branded demo instance ("Elevracorp Leads CRM") of the LeadHive product.*

</div>

---

## Overview

LeadHive is a full-featured, multi-role CRM built to help sales teams capture, distribute, and convert leads. It's designed around a real call-center-style sales pipeline — leads flow through statuses like *New → Follow Up → Call Back → Registered → Converted*, get assigned to reps, and get logged with call notes and history along the way.

The app ships with four distinct role experiences (Admin, Manager, Sales Rep, and Retention), each with its own dashboard, lead views, and permissions — so the same product scales from a single sales rep working their list to a manager overseeing a team to an admin configuring the entire pipeline.

This repo is the **frontend SPA**, built with React 19 and Vite, styled with Tailwind CSS v4, and driven entirely by a REST API over JWT-authenticated requests.

## Key Features

- **Role-based access & dashboards** — Admin, Manager, Sales Rep, and Retention roles each get a tailored dashboard with Recharts-powered visualizations (leads per status, per source, per campaign, team performance, recent assignments).
- **Lead management** — Full CRUD on leads with a rich filter/search toolbar, detail view with call notes and assignment history, and inline status/source/campaign updates.
- **Bulk actions** — Reassign, change status, update source/campaign, or delete leads in bulk across a filtered selection.
- **CSV import** — Drag-and-drop lead import with a live preview, downloadable template, batch processing, and a detailed results summary (imported vs. skipped, with reasons like duplicate email/phone or missing fields).
- **CSV export** — Filter leads by status, source, or campaign with a live matching-count preview before exporting.
- **Team & user management** — Admins manage users and roles; teams are built by assigning managers and sales reps, with dedicated team views.
- **Performance reports** — Daily, monthly, and custom date-range reports covering call volume, conversions, and per-agent leaderboards broken down by status, source, and campaign.
- **Pipeline configuration** — Admins define the taxonomy that drives the whole app: lead sources, statuses, and campaigns, all managed from a settings panel.
- **Notifications** — In-app notification center with read/unread tracking.
- **Secure by default** — JWT-based auth with client-side expiry detection, auto-logout, and cross-tab session sync.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React 19](https://react.dev/) + [Vite 6](https://vitejs.dev/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Routing | [React Router 7](https://reactrouter.com/) |
| Forms & Validation | [React Hook Form](https://react-hook-form.com/) + [Yup](https://github.com/jquense/yup) |
| Data Visualization | [Recharts](https://recharts.org/) |
| UI Components | [Headless UI](https://headlessui.com/), [Iconify](https://iconify.design/), [Tippy.js](https://atomiks.github.io/tippyjs/), [React Select](https://react-select.com/) |
| HTTP Client | [Axios](https://axios-http.com/) with JWT bearer auth |
| CSV / File Handling | [PapaParse](https://www.papaparse.com/), [React Dropzone](https://react-dropzone.js.org/) |
| PDF Export | [jsPDF](https://github.com/parallax/jsPDF) + [html2canvas](https://html2canvas.hertzen.com/) |
| Phone Input & Validation | [react-international-phone](https://github.com/goveo/react-international-phone), [libphonenumber-js](https://github.com/catamphetamine/libphonenumber-js) |
| Notifications (toasts) | [React Toastify](https://fkhadra.github.io/react-toastify/) |

> This is a frontend-only SPA — all data is served by a separate REST API (not included in this repo), consumed via JWT-authenticated requests.

## Application Structure

```
src/
├── pages/
│   ├── auth/          Login & registration
│   ├── dashboard/     Role-specific dashboards (Admin, Manager, Sales, Retention)
│   ├── leads/         Lead tables, detail views, import, bulk actions
│   ├── leadexport/    Filtered CSV export
│   ├── users/         User management (Admin)
│   ├── teams/         Team management & membership
│   ├── reports/       Call & agent performance reports (Admin)
│   ├── settings/      Lead sources, statuses & campaigns config (Admin)
│   └── profile/       Per-role profile pages
├── layouts/           Authenticated shell (sidebar, topbar) & auth layout
├── components/        Shared form controls & UI primitives
├── services/          REST API client (~60 endpoints)
├── lib/               Axios instance & auth/session utilities
└── utils/             Formatting & status/source color mapping
```

## Roles at a Glance

| Role | Access |
|---|---|
| **Admin** | Full control — users, teams, all leads, import/export, reports, pipeline settings |
| **Manager** | Team dashboard, team's leads, team member management |
| **Sales Rep** | Personal dashboard, assigned leads, profile |
| **Retention** | Retention-focused dashboard and lead queue |

## Getting Started

```bash
# Install dependencies
npm install

# Configure environment
# create a .env file in the project root, then set the variables below

# Run the dev server
npm run dev

# Build for production
npm run build
```

### Environment Variables

| Variable | Description |
|---|---|
| `VITE_LEADHIVE_API_BASEURL` | Base URL of the LeadHive backend REST API |
| `VITE_LEADHIVE_PAYMENT_MADE` | Feature flag controlling billing-based access lockout |

---

<div align="center">

Built by [zafar-m3n](https://github.com/zafar-m3n)

</div>
