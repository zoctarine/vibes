import { supabase } from '../supabase/supabase';

export const getApiUrl = () => {
  return `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api`;
};

export const callApi = async <T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    apiKey?: string;
  } = {}
): Promise<T> => {
  const { method = 'GET', body, apiKey } = options;
  
  // Get auth token for authenticated requests or use API key
  let headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  } else {
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) {
      headers['Authorization'] = `Bearer ${data.session.access_token}`;
    }
  }
  
  const response = await fetch(`${getApiUrl()}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `API request failed with status ${response.status}`
    );
  }
  
  return response.json();
};