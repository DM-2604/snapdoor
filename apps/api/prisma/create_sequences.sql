-- Create sequences for collision-safe order and invoice numbering
-- These are referenced by db-sequence.util.ts via nextval() inside transactions.
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1 INCREMENT 1;
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1 INCREMENT 1;
