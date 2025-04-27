import { supabase } from '../supabase/supabase';
import { ApiKey } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const getApiKeys = async (): Promise<ApiKey[]> => {
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const createApiKey = async (
  name: string,
  expiresAt?: Date
): Promise<ApiKey> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const key = `dk_${uuidv4().replace(/-/g, '')}`;
  
  const newApiKey = {
    name,
    key,
    owner_id: user.id,
    expires_at: expiresAt?.toISOString(),
    revoked: false,
  };

  const { data, error } = await supabase
    .from('api_keys')
    .insert([newApiKey])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const revokeApiKey = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('api_keys')
    .update({ revoked: true })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

export const deleteApiKey = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};