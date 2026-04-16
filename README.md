# Guernsey Tides App (seas.gg)

A SvelteKit application that displays tides, weather, sea temperatures, and pool cleaning schedules for Guernsey.

## Architecture

This is a monorepo with npm workspaces containing:

- **apps/web** - SvelteKit frontend application
- **apps/tide-scraper** - Standalone service that scrapes tide data
- **apps/sea-temp-scraper** - Standalone service that scrapes sea temperature (uses Playwright)
- **apps/weather-service** - Standalone service that fetches weather from Open-Meteo
- **packages/database** - Shared database package with Drizzle ORM

## Development Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
# Edit .env and add your scraping URLs
```

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string (default: `postgresql://dev:devpass@localhost:5432/tides`)
- `TIDE_URL` - URL to scrape tide data from
- `SEA_TEMP_URL` - URL to scrape sea temperature from

### 3. Start development environment

```bash
npm run dev
```

This will:
1. Start PostgreSQL in Docker (`docker-compose.db.yml`)
2. Wait for database to be ready
3. Start all Node services with hot reload:
   - Tide scraper (port: node process)
   - Sea temperature scraper (port: node process)
   - Weather service (port: node process)
   - Web app (port 5173)

Each service runs as a separate Node process with `tsx watch` for hot reloading. Services are color-coded in the terminal output.

### Individual Service Commands

```bash
# Database only (Docker)
npm run db:dev

# Individual services
npm run tide:dev        # Tide scraper
npm run sea-dev:dev     # Sea temperature scraper
npm run weather:dev     # Weather service
npm run web:dev         # Web app only
```

### Database Setup

The database schema is managed by Drizzle ORM. To set up the database:

```bash
# Start the database
npm run db:dev

# Push schema changes (development only)
npm run db:migrate

# View database with Drizzle Studio
npm run db:studio
```

## Production

For production deployment, use the full Docker Compose:

```bash
docker compose up -d
```

This runs all services in Docker containers.

## Project Structure

```
seas-gg/
├── apps/
│   ├── web/                 # SvelteKit web app
│   ├── tide-scraper/        # Tide scraping service
│   ├── sea-temp-scraper/    # Sea temperature scraping service
│   └── weather-service/     # Weather fetching service
├── packages/
│   └── database/            # Shared Drizzle ORM package
├── docker-compose.db.yml    # Dev: PostgreSQL only
├── docker-compose.yml       # Prod: All services
└── package.json             # Workspace root
```

## Environment Variable Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://dev:devpass@localhost:5432/tides` | PostgreSQL connection |
| `TIDE_URL` | - | URL to scrape tide data |
| `SEA_TEMP_URL` | - | URL to scrape sea temperature |
| `TIDE_SCRAPER_INTERVAL_MINUTES` | `60` | How often to scrape tides |
| `SEA_TEMP_SCRAPER_INTERVAL_MINUTES` | `30` | How often to scrape sea temp |
| `WEATHER_SERVICE_INTERVAL_MINUTES` | `15` | How often to fetch weather |
| `TIDE_SCRAPER_DAYS_AHEAD` | `30` | Days of tide data to fetch |
| `WEATHER_SERVICE_DAYS_AHEAD` | `7` | Days of weather to fetch |
