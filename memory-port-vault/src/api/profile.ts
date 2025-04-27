import { supabase } from '../supabase/supabase';
import { User } from '../types';

export const getProfile = async (): Promise<User> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const userObject = {
    id: user.id,
    email: user.email,
    fullName: null,
    avatarUrl: null,
  };

  // First try to get the existing profile
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // If profile exists, return it
  if (profile) {
    return {
      ...userObject,
      fullName: profile.full_name || null,
      avatarUrl: profile.avatar_url || null,
    };
  }

  // If no profile exists, create one
  const { error: insertError } = await supabase
    .from('profiles')
    .insert([{ id: user.id }]);

  if (insertError) {
    console.error('Error creating profile:', insertError);
  }

  return userObject;
};

export const updateProfile = async (
  updates: { fullName?: string; avatarUrl?: string }
): Promise<User> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      full_name: updates.fullName,
      avatar_url: updates.avatarUrl,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: user.id,
    email: user.email,
    fullName: updates.fullName,
    avatarUrl: updates.avatarUrl,
  };
};