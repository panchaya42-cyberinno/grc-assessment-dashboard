-- ================================================================
-- Legal Register + Compliance Assessment Tables
-- Run this in Supabase SQL Editor
-- ================================================================

-- 1. comp_legal_applicability
--    ทะเบียนกฎหมายที่ใช้บังคับ (ISO IMASLC01)
--    one row per regulation — org marks whether it applies
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comp_legal_applicability (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  regulation_id         UUID        NOT NULL REFERENCES comp_regulations(id) ON DELETE CASCADE,
  is_applicable         TEXT        NOT NULL DEFAULT 'tbd'
                                    CHECK (is_applicable IN ('yes','no','partial','tbd')),
  applicability_reason  TEXT,
  owner                 TEXT,
  review_date           DATE,
  next_review_date      DATE,
  notes                 TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(regulation_id)
);

-- 2. comp_clause_assessments
--    ประเมินความสอดคล้องรายมาตรา (ISO IMAFLC04)
--    one row per (clause, review_year) — annual assessment
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comp_clause_assessments (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  clause_id     UUID        NOT NULL REFERENCES comp_clauses(id) ON DELETE CASCADE,
  regulation_id UUID        NOT NULL REFERENCES comp_regulations(id) ON DELETE CASCADE,
  review_year   INT         NOT NULL DEFAULT EXTRACT(YEAR FROM NOW())::INT,
  status        TEXT        NOT NULL DEFAULT 'not_assessed'
                            CHECK (status IN ('compliant','non_compliant','in_progress','na','not_assessed')),
  evidence      TEXT,
  action_plan   TEXT,
  owner         TEXT,
  due_date      DATE,
  assessed_date DATE,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(clause_id, review_year)
);

-- 3. Indexes for performance
-- ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_legal_appl_regulation ON comp_legal_applicability(regulation_id);
CREATE INDEX IF NOT EXISTS idx_clause_assess_clause  ON comp_clause_assessments(clause_id);
CREATE INDEX IF NOT EXISTS idx_clause_assess_reg     ON comp_clause_assessments(regulation_id);
CREATE INDEX IF NOT EXISTS idx_clause_assess_year    ON comp_clause_assessments(review_year);
CREATE INDEX IF NOT EXISTS idx_clause_assess_status  ON comp_clause_assessments(status);

-- 4. Row Level Security (enable if using RLS)
-- ----------------------------------------------------------------
ALTER TABLE comp_legal_applicability  ENABLE ROW LEVEL SECURITY;
ALTER TABLE comp_clause_assessments   ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (adjust per your auth setup)
CREATE POLICY "auth_full_access" ON comp_legal_applicability
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_full_access" ON comp_clause_assessments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
