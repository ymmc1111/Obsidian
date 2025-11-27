-- Migration: 003_init_inventory
-- Description: Create the inventory table.

CREATE TYPE sensitivity_level_enum AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
);

CREATE TYPE item_status_enum AS ENUM (
    'NOMINAL',
    'LOW',
    'CRITICAL',
    'OUT_OF_STOCK'
);

CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    part_number VARCHAR(255) NOT NULL UNIQUE,
    nomenclature VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    status item_status_enum NOT NULL DEFAULT 'NOMINAL',
    sensitivity sensitivity_level_enum NOT NULL DEFAULT 'LOW',
    location VARCHAR(255),
    updated_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

-- Seed some initial data
INSERT INTO inventory_items (part_number, nomenclature, quantity, status, sensitivity, location) VALUES
('TI-4500-A', 'Titanium Alloy Plate (Grade 5)', 450, 'NOMINAL', 'LOW', 'Warehouse A-12'),
('CF-200-X', 'Carbon Fiber Sheet (3mm)', 120, 'LOW', 'MEDIUM', 'Warehouse B-04'),
('GC-9000-Z', 'Guidance Chip Set (Mil-Spec)', 50, 'CRITICAL', 'CRITICAL', 'Secure Vault 1');
