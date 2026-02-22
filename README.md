# Sync Health

Frontend for the corporate chronic disease risk prediction platform.

### **Kindly Note:** For ease of development, task splitting and hosting, the backend was developed in a separate repo. Please view it [here](https://github.com/AJ-505/sync-health-backend)

Product theme: **Data -> Prevention**  
PRD source of truth: `docs/PRD.md`

## Tech Stack

- React 19 + TypeScript
- Vite
- React Router
- TanStack Query
- Tailwind CSS
- shadcn/base-ui components
- ESLint

## Prerequisites

- Node.js 20+
- `pnpm` (required package manager)

## Getting Started

1. Install dependencies:

```bash
pnpm install
```

2. Create `.env` (or update existing) and set backend URL:

```bash
VITE_PUBLIC_BACKEND_URL=https://sync-health-backend-production.up.railway.app
```

3. Start development server:

```bash
pnpm dev
```

App runs on the Vite dev URL shown in terminal (usually `http://localhost:5173`).

## Available Scripts

- `pnpm dev` - Start local dev server
- `pnpm build` - Type-check and create production build
- `pnpm lint` - Run ESLint
- `pnpm preview` - Preview production build locally

## API Contract Notes

This frontend is aligned with the FastAPI OpenAPI contract provided for:

- `POST /auth/register`
- `POST /auth/login`
- `GET /filter/employees`
- `GET /filter/employees/all`

### Login payload

`POST /auth/login` sends:

```json
{
  "username_or_email": "string",
  "password": "string"
}
```

Auth token handling:

- Reads/writes token key: `sync-health-token`
- Reads/writes user key: `sync-health-user`

## Project Structure (Key Files)

- `src/App.tsx` - App root, routing, auth/session gating, employee query lifecycle
- `src/pages/` - Page-level UI (`landing`, `login`, `dashboard`, `employee-details`)
- `src/lib/api/client.ts` - API client and endpoint calls
- `src/lib/api/types.ts` - API request/response contracts
- `src/lib/employee-records.ts` - Maps backend employee payloads to UI member records
- `src/components/` - shared UI components/theme provider

## Validation Checklist (Before Handoff)

Run both commands:

```bash
pnpm lint
pnpm build
```

## Notes

- Theme initialization is applied before React hydration in `index.html` to avoid light/dark flash.
- Keep scope and feature behavior aligned with `docs/PRD.md`.
