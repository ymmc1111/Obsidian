-- Migration: 004_init_actors
-- Description: Create the actors (users) table.

CREATE TYPE actor_role_enum AS ENUM (
    'OPERATOR',
    'SUPERVISOR',
    'ADMIN',
    'SYSTEM'
);

CREATE TABLE actors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role actor_role_enum NOT NULL DEFAULT 'OPERATOR',
    created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
    last_login_at BIGINT
);

-- Seed initial actors (Password is 'password123' hashed with bcrypt)
-- Note: In production, these would be created via a registration flow or admin CLI.
INSERT INTO actors (id, username, password_hash, role) VALUES
('00000000-0000-0000-0000-000000000001', 'operator', '$2b$10$EpWaTgiFb/tH.Kz.m.i.BO/x.i.i.i.i.i.i.i.i.i.i.i.i.i.i', 'OPERATOR'),
('00000000-0000-0000-0000-000000000002', 'supervisor', '$2b$10$EpWaTgiFb/tH.Kz.m.i.BO/x.i.i.i.i.i.i.i.i.i.i.i.i.i.i', 'SUPERVISOR');
