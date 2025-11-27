-- Migration: 001_init_ledger_events
-- Description: Create the immutable ledger_events table for the "Glass Vault" architecture.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE action_type_enum AS ENUM (
    'BATCH_CREATE',
    'STEP_SIGN',
    'DEVIATION_LOG',
    'SYSTEM_OVERRIDE',
    'DEPLOYMENT'
);

CREATE TABLE ledger_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prev_hash VARCHAR(64) NOT NULL, -- SHA-256 hash of the previous row
    actor_id UUID NOT NULL,
    secondary_actor_id UUID, -- Nullable, for Double Sig
    action_type action_type_enum NOT NULL,
    payload JSONB NOT NULL, -- The encrypted data
    signature VARCHAR(255) NOT NULL, -- Ed25519 signature of the payload
    timestamp BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
    
    -- Constraint: Ensure the chain integrity (This is a simplified check, real enforcement is in logic)
    CONSTRAINT ensure_hash_length CHECK (LENGTH(prev_hash) = 64)
);

-- Index for fast lookups by actor
CREATE INDEX idx_ledger_actor ON ledger_events(actor_id);

-- Index for time-series analysis
CREATE INDEX idx_ledger_timestamp ON ledger_events(timestamp);

-- Comment: This table is APPEND-ONLY. Updates and Deletes should be revoked for the application user.
