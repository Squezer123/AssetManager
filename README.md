# Asset Manager — Company Equipment Rental System

A fullstack web application for managing company equipment rentals (laptops, phones, cameras, and other equipment). Supports browsing the catalog, reserving equipment by date range or by hour, viewing reservation history, and an admin panel.

## Tech stack

- **Next.js** (App Router) + JavaScript
- **PostgreSQL** as the database
- **Prisma** (v6) as the ORM
- **Tailwind CSS** for styling
- **NextAuth** for authentication and sessions
- **Docker** for running PostgreSQL locally

## Prerequisites

- Node.js (LTS)
- npm
- Docker Desktop (for the local database)

## Getting started

### 1. Clone the repository and install dependencies

```bash
git clone https://github.com/Squezer123/AssetManager
cd assetsmanager
npm install
```

### 2. Start local PostgreSQL via Docker

Make sure Docker Desktop is running, then from the project root:

```bash
docker compose up -d
```

Check that the container is running:

```bash
docker compose ps
```

### 3. Configure environment variables

Copy the example file and fill it in:

```bash
cp .env.example .env
```

Default `DATABASE_URL` for the local Docker container (matching `docker-compose.yml`):

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wypozyczenia"
```

### 4. Apply database migrations

```bash
npx prisma migrate dev
```

This creates all tables (`User`, `Equipment`, `LaptopSpec`, `PhoneSpec`, `CameraSpec`, `Reservation`) according to the schema in `prisma/schema.prisma`.

### 5. Seed the database with test data

```bash
npx prisma db seed
```

Creates sample users, equipment (with linked specs), and a few reservations.

**Test accounts created by the seed** (password for all: `password123`):

| Email | Role |
|---|---|
| admin@firma.pl | ADMIN |
| jan.kowalski@firma.pl | USER |
| anna.nowak@firma.pl | USER |

### 6. Run the app in development mode

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## Useful commands

| Command | Description |
|---|---|
| `npm run dev` | Runs the Next.js development server |
| `docker compose up -d` | Starts the PostgreSQL container in the background |
| `docker compose down` | Stops the container (data is preserved) |
| `docker compose down -v` | Stops the container and **deletes the data** (clean start) |
| `npx prisma studio` | Opens a GUI for browsing/editing database data (`http://localhost:5555`) |
| `npx prisma migrate dev --name <name>` | Creates and applies a new migration after changing `schema.prisma` |
| `npx prisma migrate reset` | Wipes the database, reapplies all migrations from scratch, and automatically runs the seed |
| `npx prisma db seed` | Manually re-populates the database with test data |

## User roles

Roles (`USER` / `ADMIN`) are assigned **manually in the database** — there is no UI for managing roles. To grant someone the admin role:

```bash
npx prisma studio
```

Open the `User` table, find the relevant record, and change its `role` field to `ADMIN`.

## Feature scope

- Browse the equipment catalog along with availability
- Reserve equipment for a date range (full days, with a preparation buffer) or for an hour range (for equipment with `bufferDays: 0`, minimum 1 hour)
- Automatic collision validation on both creation and editing of reservations
- Logged-in user's reservation history, with the ability to:
  - cancel a reservation (only before it starts)
  - edit the date/hour range (full edit before start, extend-only once it has started)
  - mark equipment as returned (ends the reservation immediately)
- Admin panel:
  - Equipment CRUD (with typed specs for laptops/phones/cameras)
  - View of all reservations in the system
  - Ability to permanently delete any reservation
- Registration and login with role-based access (user/admin)

## Data model (summary)

- **User** — user account, role (`USER`/`ADMIN`)
- **Equipment** — base equipment record (name, category, status, image, preparation buffer)
- **LaptopSpec / PhoneSpec / CameraSpec** — technical specs in a 1:1 relation with `Equipment`, depending on category
- **Reservation** — a reservation (date/hour range, status: `ACTIVE`/`CANCELLED`/`RETURNED`)

Full schema: `prisma/schema.prisma`.

## Deployment

This project is intended for a test deployment (not a production company rollout):

- **App hosting:** Vercel
- **Database:** free tier of Neon or Supabase

When deploying to Vercel, simply swap `DATABASE_URL` in the project's environment variables for the connection string from Neon/Supabase — the rest of the code stays unchanged.

## Note on Prisma version

This project uses **Prisma 6** (not 7), because Prisma 7 requires configuration via `prisma.config.ts` and a database adapter (`@prisma/adapter-pg`) instead of a simple `url` in `schema.prisma`. For the scope of this project, the simpler, earlier version was chosen.
