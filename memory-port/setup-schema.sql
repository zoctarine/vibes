-- Create conversation summaries table
CREATE TABLE IF NOT EXISTS conversation_summaries (
  id SERIAL PRIMARY KEY,
  client_id TEXT NOT NULL,
  summary_key TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  last_accessed TIMESTAMPTZ,
  UNIQUE(client_id, summary_key)
);

-- Create index for quicker lookups
CREATE INDEX IF NOT EXISTS idx_client_id ON conversation_summaries(client_id);

-- Optional: Add RLS policies if needed
-- Example policy for row-level security:
-- ALTER TABLE conversation_summaries ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can only access their own summaries"
--   ON conversation_summaries
--   USING (client_id = current_setting('app.client_id', TRUE)); 