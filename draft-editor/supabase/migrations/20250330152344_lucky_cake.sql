/*
  # Add default projects

  1. Changes
    - Insert three default projects for all users
    - Set up example content structure
*/

-- Function to create default projects for a user
CREATE OR REPLACE FUNCTION create_default_projects(user_id uuid)
RETURNS void AS $$
DECLARE
  midnight_chronicles_id uuid;
  oceans_whispers_id uuid;
  neon_city_id uuid;
BEGIN
  -- The Midnight Chronicles
  INSERT INTO projects (id, title, description, owner_id, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    'The Midnight Chronicles',
    'A dark fantasy novel series following the mysterious events that unfold in a world where night never ends.',
    user_id,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '15 minutes'
  ) RETURNING id INTO midnight_chronicles_id;

  -- Ocean's Whispers
  INSERT INTO projects (id, title, description, owner_id, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    'Ocean''s Whispers',
    'A maritime adventure story about a mysterious message in a bottle that leads to an unforgettable journey across the seven seas.',
    user_id,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '2 days'
  ) RETURNING id INTO oceans_whispers_id;

  -- Neon City Legends
  INSERT INTO projects (id, title, description, owner_id, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    'Neon City Legends',
    'A cyberpunk anthology exploring the interconnected lives of people living in a sprawling megalopolis where technology and humanity blur.',
    user_id,
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '3 days'
  ) RETURNING id INTO neon_city_id;

  -- Create initial document structure for each project
  -- The Midnight Chronicles
  INSERT INTO documents (title, content, type, owner_id, project_id)
  VALUES (
    'The Midnight Chronicles',
    'In a world where darkness reigns eternal, hope becomes the most precious currency.',
    'folder',
    user_id,
    midnight_chronicles_id
  );

  -- Ocean's Whispers
  INSERT INTO documents (title, content, type, owner_id, project_id)
  VALUES (
    'Ocean''s Whispers',
    'The bottle washed ashore on a Tuesday morning, carrying within it a secret that would change everything.',
    'folder',
    user_id,
    oceans_whispers_id
  );

  -- Neon City Legends
  INSERT INTO documents (title, content, type, owner_id, project_id)
  VALUES (
    'Neon City Legends',
    'Above the neon-lit streets, dreams and nightmares intertwine in the digital haze.',
    'folder',
    user_id,
    neon_city_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to add default projects for new users
CREATE OR REPLACE FUNCTION add_default_projects_on_signup()
RETURNS trigger AS $$
BEGIN
  PERFORM create_default_projects(NEW.id);
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't prevent user creation
    RAISE NOTICE 'Error creating default projects: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to create default projects for new users
DROP TRIGGER IF EXISTS add_default_projects_on_signup ON auth.users;
CREATE TRIGGER add_default_projects_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION add_default_projects_on_signup();

-- Create default projects for existing users
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM auth.users
  LOOP
    -- Only create projects if user doesn't have any
    IF NOT EXISTS (
      SELECT 1 FROM projects WHERE owner_id = user_record.id
    ) THEN
      PERFORM create_default_projects(user_record.id);
    END IF;
  END LOOP;
END $$;