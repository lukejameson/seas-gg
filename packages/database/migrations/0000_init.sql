-- Initial schema creation
-- This migration creates the base tables if they don't exist

-- Daily tides table
CREATE TABLE IF NOT EXISTS daily_tides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Sea temperature table
CREATE TABLE IF NOT EXISTS sea_temp (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    sea_temp_c TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pool cleaning dates table
CREATE TABLE IF NOT EXISTS pool_cleaning_dates (
    id BIGSERIAL PRIMARY KEY,
    date DATE,
    pools TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Weather cache table
CREATE TABLE IF NOT EXISTS weather_cache (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_tides_date ON daily_tides(date);
CREATE INDEX IF NOT EXISTS idx_sea_temp_date ON sea_temp(date);
CREATE INDEX IF NOT EXISTS idx_pool_cleaning_dates_date ON pool_cleaning_dates(date);
CREATE INDEX IF NOT EXISTS idx_weather_cache_date ON weather_cache(date);
