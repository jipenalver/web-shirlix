# Shirlix - Inventory System

A multi-branch inventory, sales, and expense management system built with Vue 3, Vuetify, and Supabase.

## Features

- **User management**: branches, users, and user roles with per-page access control
- **Product management**: product information and images
- **Inventory**: stock in, stock segregation, check out (sales), and stock transfers between branches
- **Expenses**: record and manage expenditures
- **Reports**: running inventory, stocks, sales status, sales summary, and expenses, with CSV export
- **Approval codes**: one-time codes, generated from the dashboard, that authorize protected stock and sales actions

## Tech Stack

- [Vue 3](https://vuejs.org/), [Vue Router](https://router.vuejs.org/), and [Pinia](https://pinia.vuejs.org/)
- [Vuetify 3](https://vuetifyjs.com/) with [Material Design Icons](https://pictogrammers.com/library/mdi/)
- [Supabase](https://supabase.com/) for the database, authentication, and storage
- [ApexCharts](https://apexcharts.com/) and [Leaflet](https://leafletjs.com/) for dashboard widgets
- [Vite](https://vitejs.dev/) for the build, [Vercel](https://vercel.com/) for hosting

## Getting Started

### Prerequisites

- Node.js and npm
- A Supabase project

The database schema is not stored in this repository. The app expects these tables in your Supabase project:

`branches`, `codes`, `customer_payments`, `customers`, `expenses`, `products`, `sale_products`, `sales`, `stock_ins`, `user_role_pages`, `user_roles`

It also expects a storage bucket named `shirlix`.

### Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Create a `.env` file in the project root:

   ```sh
   VITE_SUPABASE_URL=
   VITE_SUPABASE_ANON_KEY=
   VITE_SUPABASE_SERVICE_ROLE=
   ```

3. Start the development server:

   ```sh
   npm run dev
   ```

> **Security note:** Vite includes every `VITE_` variable in the client bundle, so `VITE_SUPABASE_SERVICE_ROLE` is readable by anyone who can load the app. This key bypasses Row Level Security. It is used for user administration in `src/stores/users.js`.

## Scripts

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Start the development server             |
| `npm run build`   | Build for production                     |
| `npm run preview` | Preview the production build             |
| `npm run lint`    | Lint and auto-fix with ESLint            |
| `npm run format`  | Format `src/` with Prettier              |

## Project Structure

```text
src/
├── assets/       # Global styles
├── components/   # UI components, grouped by feature
├── composables/  # Reusable table and auth logic
├── router/       # Routes and navigation guards
├── stores/       # Pinia stores and Supabase queries
├── utils/        # Supabase clients, helpers, and validators
└── views/        # Page-level components
```

## Access Control

The `Super Administrator` role can open every page. Other roles can open only the pages assigned to them in `user_role_pages`, plus pages marked `isDefault` in `src/router/routes.js`. The router enforces this check in the browser, in `src/router/index.js`.

## Deployment

The app deploys to Vercel. `vercel.json` rewrites all paths to `/` so client-side routing works. Set the environment variables above in the Vercel project.
