import { supabase } from '../supabase/supabase';
import { Project } from '../types';

export const getProjects = async (): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const projectsWithCounts = await Promise.all(
    data.map(async (project) => {
      const { count, error: countError } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id);

      if (countError) {
        console.error('Error fetching document count:', countError);
      }

      return {
        ...project,
        documentCount: count || 0,
      };
    })
  );

  return projectsWithCounts;
};

export const getProject = async (id: string): Promise<Project> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const { count, error: countError } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', id);

  if (countError) {
    console.error('Error fetching document count:', countError);
  }

  return {
    ...data,
    documentCount: count || 0,
  };
};

export const createProject = async (project: Partial<Project>): Promise<Project> => {
  const { data, error } = await supabase
    .from('projects')
    .insert([project])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    ...data,
    documentCount: 0,
  };
};

export const updateProject = async (id: string, project: Partial<Project>): Promise<Project> => {
  const { data, error } = await supabase
    .from('projects')
    .update(project)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const { count, error: countError } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', id);

  if (countError) {
    console.error('Error fetching document count:', countError);
  }

  return {
    ...data,
    documentCount: count || 0,
  };
};

export const deleteProject = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};