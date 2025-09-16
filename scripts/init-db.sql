-- Initialize database with extensions and basic setup
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for full-text search
CREATE INDEX IF NOT EXISTS idx_use_cases_search ON use_cases USING gin(to_tsvector('english', name || ' ' || description));

-- Create custom types
DO $$ BEGIN
    CREATE TYPE severity_level AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE maturity_status AS ENUM ('draft', 'testing', 'production', 'deprecated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE deployment_status AS ENUM ('draft', 'pending', 'deployed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;