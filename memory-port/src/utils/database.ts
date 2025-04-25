import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from '../config/env.js';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Function to ensure the database schema exists
export async function ensureSchemaExists() {
  try {
    // Check if the table exists
    const { error } = await supabase
      .from('conversation_summaries')
      .select('id')
      .limit(1);

    // If we get a specific error about the table not existing
    if (error && error.code === '42P01') {
      console.error('Table does not exist. Creating schema...');

      // For Supabase, you typically set up tables via the web interface
      // or migrations. This is a simplified example.
      const { error: createError } = await supabase.rpc('create_summaries_table');

      if (createError) {
        console.error('Error creating table:', createError);
        console.error('Please create the following table in Supabase:');
        console.error(`
          CREATE TABLE conversation_summaries (
            id SERIAL PRIMARY KEY,
            client_id TEXT NOT NULL,
            summary_key TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL,
            updated_at TIMESTAMPTZ NOT NULL,
            last_accessed TIMESTAMPTZ,
            UNIQUE(client_id, summary_key)
          );
          CREATE INDEX idx_client_id ON conversation_summaries(client_id);
        `);
      }
    }
  } catch (err) {
    console.error('Error checking schema:', err);
  }
}