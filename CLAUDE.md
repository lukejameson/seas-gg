# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Guernsey Tides App (seas-gg) - A SvelteKit application that displays tides, weather, sea temperatures, and pool cleaning schedules for Guernsey. Built with Svelte 5 and uses PostgreSQL for data persistence.

## Commands

- `npm run dev` - Start development server (runs on port 5000)
- `npm run build` - Build for production (outputs to `build/`)
- `npm run preview` - Preview production build
- `npm run check` - Run Svelte type checking
- `npm run lint` - Check formatting with Prettier and lint with ESLint
- `npm run fmt` - Format code with Prettier

## Architecture

### Data Flow
The main page (`src/routes/+page.server.js`) fetches data from four internal API endpoints in parallel:
- `/tides` - Tide data (scraped and cached in DB)
- `/weather` - Weather data (from Open-Meteo API)
- `/sea_temp` - Sea temperature (scraped and cached in DB)
- `/pools/clean` - Pool cleaning schedule

### Server-Side Services (`src/lib/server/`)
- `main.js` - Orchestrates tide and sea temperature data retrieval with DB caching
- `database_worker.js` - PostgreSQL connection pool and queries
- `tides-scraper.js` - Scrapes tide data from external source
- `sea-temperature-scraper.js` - Scrapes sea temperature data
- `daily-weather-service.js` - Fetches weather from Open-Meteo API (Guernsey coordinates)
- `html_parser.js` - Parses scraped HTML for tide data

### Components (`src/lib/components/`)
Components use `+` prefix naming convention (e.g., `+Tides.svelte`, `+Weather.svelte`).

### Types
JSDoc type definitions are in `src/lib/types.js` - includes Tide, HourlyWeather, SeaTemperature, etc.

## Database

PostgreSQL with three main tables:
- `daily_tides` - Cached tide data (JSON stored in `data` column)
- `sea_temp` - Sea temperature readings
- `pool_cleaning_dates` - Pool cleaning schedule

SQL schema files are in `sql/` directory.

### Environment Variables
```
POSTGRES_HOST
POSTGRES_PORT (default: 5432)
POSTGRES_DATABASE
POSTGRES_USER
POSTGRES_PASSWORD
POSTGRES_SSL (set to 'true' for SSL)
```

### Local Development Database
```bash
docker run -d --name my-postgres -e POSTGRES_USER=dev -e POSTGRES_PASSWORD=Pass.Word! -e POSTGRES_DB=tides -p 5432:5432 postgres:latest
```

## Production
Uses `@sveltejs/adapter-node` with HTML minification in `hooks.server.js`.
