#!/bin/sh
set -e

echo "Running database migrations..."

# Extract host and user from DATABASE_URL if individual vars aren't set
# DATABASE_URL format: postgresql://user:pass@host:port/dbname
if [ -z "$POSTGRES_HOST" ] && [ -n "$DATABASE_URL" ]; then
  POSTGRES_HOST=$(echo "$DATABASE_URL" | sed -E 's|.*@([^:/]+).*|\1|')
fi
if [ -z "$POSTGRES_USER" ] && [ -n "$DATABASE_URL" ]; then
  POSTGRES_USER=$(echo "$DATABASE_URL" | sed -E 's|.*://([^:]+):.*|\1|')
fi

# Wait for postgres to be ready
until pg_isready -h "$POSTGRES_HOST" -p "${POSTGRES_PORT:-5432}" -U "$POSTGRES_USER"; do
  echo "Waiting for postgres..."
  sleep 1
done

echo "PostgreSQL is ready!"

# Run the init SQL file if tables don't exist
# This is idempotent - safe to run multiple times
psql "$DATABASE_URL" -f /migrations/0000_init.sql

echo "Migrations complete!"
