-- AI Models Table
CREATE TABLE IF NOT EXISTS ai_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Classification', 'Regression', 'NLP', 'Generative', 'Computer Vision', 'Recommendation')),
  department TEXT NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('Critical', 'High', 'Medium', 'Low')),
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Under Review', 'Deprecated', 'Development')),
  bias_score DECIMAL(5,2) CHECK (bias_score >= 0 AND bias_score <= 100),
  fairness_score DECIMAL(5,2) CHECK (fairness_score >= 0 AND fairness_score <= 100),
  accuracy_score DECIMAL(5,2) CHECK (accuracy_score >= 0 AND accuracy_score <= 100),
  description TEXT,
  owner TEXT,
  last_audit_date DATE,
  next_audit_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Incidents Table
CREATE TABLE IF NOT EXISTS ai_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  model_id UUID REFERENCES ai_models(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN ('Bias', 'Hallucination', 'Data Leakage', 'Performance', 'Security', 'Privacy', 'Other')),
  severity TEXT NOT NULL CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Investigating', 'Resolved', 'Closed')),
  reported_by TEXT,
  assigned_to TEXT,
  resolution TEXT,
  root_cause TEXT,
  reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Risk Scores Table (for tracking historical risk scores)
CREATE TABLE IF NOT EXISTS ai_risk_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID REFERENCES ai_models(id) ON DELETE CASCADE,
  risk_score DECIMAL(5,2) NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  bias_score DECIMAL(5,2),
  fairness_score DECIMAL(5,2),
  accuracy_score DECIMAL(5,2),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Compliance Checklist Table
CREATE TABLE IF NOT EXISTS ai_compliance_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  standard TEXT NOT NULL,
  requirement TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Not Started' CHECK (status IN ('Completed', 'In Progress', 'Not Started')),
  coverage_percentage INTEGER DEFAULT 0 CHECK (coverage_percentage >= 0 AND coverage_percentage <= 100),
  due_date DATE,
  assigned_to TEXT,
  evidence_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_compliance_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (for dashboard)
CREATE POLICY "Allow public read access on ai_models" ON ai_models FOR SELECT USING (true);
CREATE POLICY "Allow public read access on ai_incidents" ON ai_incidents FOR SELECT USING (true);
CREATE POLICY "Allow public read access on ai_risk_scores" ON ai_risk_scores FOR SELECT USING (true);
CREATE POLICY "Allow public read access on ai_compliance_items" ON ai_compliance_items FOR SELECT USING (true);

-- Create policies for insert/update/delete (require authentication later)
CREATE POLICY "Allow public insert on ai_models" ON ai_models FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on ai_models" ON ai_models FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on ai_models" ON ai_models FOR DELETE USING (true);

CREATE POLICY "Allow public insert on ai_incidents" ON ai_incidents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on ai_incidents" ON ai_incidents FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on ai_incidents" ON ai_incidents FOR DELETE USING (true);

CREATE POLICY "Allow public insert on ai_risk_scores" ON ai_risk_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on ai_risk_scores" ON ai_risk_scores FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on ai_risk_scores" ON ai_risk_scores FOR DELETE USING (true);

CREATE POLICY "Allow public insert on ai_compliance_items" ON ai_compliance_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on ai_compliance_items" ON ai_compliance_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on ai_compliance_items" ON ai_compliance_items FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_models_department ON ai_models(department);
CREATE INDEX IF NOT EXISTS idx_ai_models_risk_level ON ai_models(risk_level);
CREATE INDEX IF NOT EXISTS idx_ai_incidents_model_id ON ai_incidents(model_id);
CREATE INDEX IF NOT EXISTS idx_ai_incidents_category ON ai_incidents(category);
CREATE INDEX IF NOT EXISTS idx_ai_incidents_status ON ai_incidents(status);
CREATE INDEX IF NOT EXISTS idx_ai_risk_scores_model_id ON ai_risk_scores(model_id);
CREATE INDEX IF NOT EXISTS idx_ai_compliance_items_standard ON ai_compliance_items(standard);
