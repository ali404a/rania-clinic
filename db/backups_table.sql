-- Migration: Create backups table for backup/restore functionality
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS backups (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by INTEGER REFERENCES users(id),
  type TEXT NOT NULL DEFAULT 'manual',
  size_bytes INTEGER,
  table_count INTEGER,
  data JSONB
);

CREATE INDEX IF NOT EXISTS idx_backups_created_at ON backups (created_at DESC);
