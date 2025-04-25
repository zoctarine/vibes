import { supabase } from '../utils/database.js';
import { CLIENT_API_KEY } from '../config/env.js';

export class SummaryStorage {
  // Table name in Supabase
  static tableName = 'conversation_summaries';

  // Save a summary to Supabase
  static async saveData(summaryKey: string, data: string): Promise<string> {
    try {
      // Create compound key with client API key
      const compoundKey = `${CLIENT_API_KEY}/${summaryKey}`;

      // Check if entry already exists
      const { data: existingData, error: checkError } = await supabase
        .from(this.tableName)
        .select('id')
        .eq('client_id', CLIENT_API_KEY)
        .eq('summary_key', summaryKey)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingData) {
        // Update existing entry
        const { error } = await supabase
          .from(this.tableName)
          .update({
            content: data,
            updated_at: new Date().toISOString()
          })
          .eq('client_id', CLIENT_API_KEY)
          .eq('summary_key', summaryKey);

        if (error) throw error;
      } else {
        // Insert new entry
        const { error } = await supabase
          .from(this.tableName)
          .insert({
            client_id: CLIENT_API_KEY,
            summary_key: summaryKey,
            content: data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      console.log(`[STORAGE] Saved summary with key: ${summaryKey}`);
      return compoundKey;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[ERROR] Failed to save summary: ${message}`);
      throw new Error(`Failed to save summary: ${message}`);
    }
  }

  // Load a summary from Supabase
  static async loadData(summaryKey: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('content')
        .eq('client_id', CLIENT_API_KEY)
        .eq('summary_key', summaryKey)
        .single();

      if (error) throw error;
      if (!data) throw new Error(`No summary found with key: ${summaryKey}`);

      console.log(`[STORAGE] Loaded summary with key: ${summaryKey}`);

      // Update the last accessed timestamp
      await supabase
        .from(this.tableName)
        .update({ last_accessed: new Date().toISOString() })
        .eq('client_id', CLIENT_API_KEY)
        .eq('summary_key', summaryKey);

      return data.content;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[ERROR] Failed to load summary: ${message}`);
      throw new Error(`Failed to load summary: ${message}`);
    }
  }

  // List all summaries for the current client
  static async listSummaries() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('summary_key, created_at, updated_at')
        .eq('client_id', CLIENT_API_KEY)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[ERROR] Failed to list summaries: ${message}`);
      throw new Error(`Failed to list summaries: ${message}`);
    }
  }

  // Delete a summary
  static async deleteData(summaryKey: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('client_id', CLIENT_API_KEY)
        .eq('summary_key', summaryKey);

      if (error) throw error;

      console.log(`[STORAGE] Deleted summary with key: ${summaryKey}`);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[ERROR] Failed to delete summary: ${message}`);
      throw new Error(`Failed to delete summary: ${message}`);
    }
  }
}