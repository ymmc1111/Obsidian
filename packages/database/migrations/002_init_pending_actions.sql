-- Migration: 002_init_pending_actions
-- Description: Create the pending_actions table for the "Double-Sig" workflow.

CREATE TYPE pending_action_status_enum AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'EXPIRED'
);

CREATE TABLE pending_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    initiator_id UUID NOT NULL,
    action_type action_type_enum NOT NULL,
    payload JSONB NOT NULL,
    required_signatures INT DEFAULT 2,
    current_signatures INT DEFAULT 1, -- Initiator counts as 1
    expires_at BIGINT NOT NULL,
    status pending_action_status_enum DEFAULT 'PENDING',
    created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

CREATE INDEX idx_pending_initiator ON pending_actions(initiator_id);
CREATE INDEX idx_pending_status ON pending_actions(status);
