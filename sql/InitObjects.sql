CREATE TABLE weekly_tides (
    id UUID PRIMARY KEY,
    startOfWeekDate DATE NOT NULL UNIQUE,
    endOfWeekDate DATE NOT NULL UNIQUE,
    data JSONB NOT NULL,
    -- Add a GIN index for the entire JSONB document
    -- This helps when querying nested fields
    CONSTRAINT date_matches CHECK (startOfWeekDate = (data->>'startOfWeekDate')::DATE)
);

-- Create indexes for common query patterns
CREATE INDEX idx_weekly_tides_start_date ON weekly_tides(startOfWeekDate);
CREATE INDEX idx_weekly_tides_end_date ON weekly_tides(endOfWeekDate);

-- Index for querying basic tides
CREATE INDEX idx_weekly_tides ON weekly_tides USING GIN ((data->'tides'));


CREATE TABLE daily_tides (
    id UUID PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    data JSONB NOT NULL,
    -- Add a GIN index for the entire JSONB document
    -- This helps when querying nested fields
    CONSTRAINT date_matches CHECK (date = (data->>'date')::DATE)
);

-- Create indexes for common query patterns
CREATE INDEX idx_daily_tides_date ON daily_tides(date);

-- Index for querying basic tides
CREATE INDEX idx_basic_tides ON daily_tides USING GIN ((data->'basicTides'));

