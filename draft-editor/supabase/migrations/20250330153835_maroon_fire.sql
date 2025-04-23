/*
  # Add default projects

  1. Changes
    - Insert three default projects for all users
    - Set up example content structure with nested chapters and scenes
    - Add rich content examples for each project
*/

-- Function to create default projects for a user
CREATE OR REPLACE FUNCTION create_default_projects(user_id uuid)
RETURNS void AS $$
DECLARE
  midnight_chronicles_id uuid;
  oceans_whispers_id uuid;
  neon_city_id uuid;
  
  -- Root document IDs
  midnight_root_id uuid;
  oceans_root_id uuid;
  neon_root_id uuid;
  
  -- Chapter IDs
  mc_chapter1_id uuid;
  mc_chapter2_id uuid;
  ow_chapter1_id uuid;
  ow_chapter2_id uuid;
  nc_chapter1_id uuid;
  nc_chapter2_id uuid;
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

  -- Create root documents for each project
  -- The Midnight Chronicles root
  INSERT INTO documents (title, content, type, owner_id, project_id)
  VALUES (
    'The Midnight Chronicles',
    '# The Midnight Chronicles

In a world shrouded in perpetual darkness, where the sun is nothing but a distant memory, humanity clings to the remnants of civilization. This is a tale of hope, survival, and the extraordinary individuals who dare to challenge the eternal night.',
    'folder',
    user_id,
    midnight_chronicles_id
  ) RETURNING id INTO midnight_root_id;

  -- Midnight Chronicles - Chapter 1
  INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
  VALUES (
    'Chapter 1: The Eternal Night',
    'The first chapter explores the origins of the endless darkness and introduces our main characters as they navigate this changed world.',
    'chapter',
    user_id,
    midnight_chronicles_id,
    midnight_root_id
  ) RETURNING id INTO mc_chapter1_id;

  -- Midnight Chronicles - Chapter 1 Scenes
  INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
  VALUES
    ('The Last Sunset', 
     'Sarah remembered the last sunset as if it were yesterday, though fifteen years had passed. The sky had blazed with unprecedented colors - crimson, gold, and violet swirling together in a farewell performance that no one realized was final. She had been only twelve then, watching from her bedroom window as darkness crept across the world like spilled ink, never to recede.',
     'scene',
     user_id,
     midnight_chronicles_id,
     mc_chapter1_id),
    ('The Lantern District',
     'The Lantern District was a maze of perpetually lit streets, where the wealthy maintained their illusion of daylight with precious luminescent crystals. Marcus walked these streets every day, delivering messages between the grand houses, each step a reminder of the divide between those who could afford to keep the darkness at bay and those who had learned to embrace it.',
     'scene',
     user_id,
     midnight_chronicles_id,
     mc_chapter1_id);

  -- Midnight Chronicles - Chapter 2
  INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
  VALUES (
    'Chapter 2: Whispers in the Dark',
    'Our heroes discover ancient texts that hint at the true nature of the eternal night, leading them on a dangerous quest.',
    'chapter',
    user_id,
    midnight_chronicles_id,
    midnight_root_id
  ) RETURNING id INTO mc_chapter2_id;

  -- Midnight Chronicles - Chapter 2 Scenes
  INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
  VALUES
    ('The Archives',
     'The Great Library stood as a testament to the old world, its towering shelves disappearing into the darkness above. Here, in the silence broken only by the soft crackle of eternal flames, Sarah found the first clue - a weathered journal speaking of a time when the sun still ruled the sky.',
     'scene',
     user_id,
     midnight_chronicles_id,
     mc_chapter2_id),
    ('The Prophet''s Warning',
     'The old man''s eyes gleamed with an unsettling intensity in the lamplight. "They thought they could control it," he whispered, his voice trembling. "They thought they could harness the power of eternal night. But some doors, once opened, can never be closed."',
     'scene',
     user_id,
     midnight_chronicles_id,
     mc_chapter2_id);

  -- Ocean's Whispers root
  INSERT INTO documents (title, content, type, owner_id, project_id)
  VALUES (
    'Ocean''s Whispers',
    '# Ocean''s Whispers

A tale of mystery and adventure on the high seas, where a simple message in a bottle leads to an extraordinary journey that will change the lives of those who dare to follow its call.',
    'folder',
    user_id,
    oceans_whispers_id
  ) RETURNING id INTO oceans_root_id;

  -- Ocean's Whispers - Chapter 1
  INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
  VALUES (
    'Chapter 1: The Message',
    'The discovery of a mysterious message in a bottle sets our story in motion.',
    'chapter',
    user_id,
    oceans_whispers_id,
    oceans_root_id
  ) RETURNING id INTO ow_chapter1_id;

  -- Ocean's Whispers - Chapter 1 Scenes
  INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
  VALUES
    ('Morning Tide',
     'The bottle gleamed like a jewel in the morning sun, half-buried in the wet sand. Captain Elena Martinez might have missed it entirely if not for the peculiar blue glass catching the light just so. She had walked this beach a thousand times, but something about this morning felt different.',
     'scene',
     user_id,
     oceans_whispers_id,
     ow_chapter1_id),
    ('The Ancient Script',
     'The parchment inside was perfectly preserved, protected by the sealed bottle for what must have been decades. The script was unlike anything Elena had ever seen - flowing characters that seemed to shift and change as she studied them, like waves on the ocean.',
     'scene',
     user_id,
     oceans_whispers_id,
     ow_chapter1_id);

  -- Ocean's Whispers - Chapter 2
  INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
  VALUES (
    'Chapter 2: The First Clue',
    'The team begins to unravel the mystery of the message, leading them to an unexpected destination.',
    'chapter',
    user_id,
    oceans_whispers_id,
    oceans_root_id
  ) RETURNING id INTO ow_chapter2_id;

  -- Ocean's Whispers - Chapter 2 Scenes
  INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
  VALUES
    ('The Scholar''s Study',
     'Professor Chen''s office was a maze of books and maritime charts, the air thick with the smell of old paper and sea salt. "This," he said, pointing to a symbol on the mysterious message, "this changes everything we thought we knew about the lost civilization."',
     'scene',
     user_id,
     oceans_whispers_id,
     ow_chapter2_id),
    ('Preparations',
     'The Stellar Wind was a fine vessel, but preparing for an expedition to uncharted waters was no small task. Elena watched as her crew loaded supplies, each member carefully chosen for what might be the most important journey of their lives.',
     'scene',
     user_id,
     oceans_whispers_id,
     ow_chapter2_id);

  -- Neon City Legends root
  INSERT INTO documents (title, content, type, owner_id, project_id)
  VALUES (
    'Neon City Legends',
    '# Neon City Legends

Welcome to New Shanghai, 2157. A sprawling megalopolis where the lines between human and machine blur, where dreams are traded like currency, and where stories intertwine in the shadows of towering skyscrapers.',
    'folder',
    user_id,
    neon_city_id
  ) RETURNING id INTO neon_root_id;

  -- Neon City - Chapter 1
  INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
  VALUES (
    'Chapter 1: Digital Dreams',
    'An introduction to the cyberpunk world of New Shanghai through the eyes of a young hacker.',
    'chapter',
    user_id,
    neon_city_id,
    neon_root_id
  ) RETURNING id INTO nc_chapter1_id;

  -- Neon City - Chapter 1 Scenes
  INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
  VALUES
    ('The Hack',
     'Jin''s fingers danced across the holographic interface, leaving trails of neon blue in their wake. The corporate firewall loomed before her like a digital fortress, but she had never met an encryption she couldn''t crack. "Just another day at the office," she whispered to herself, as the first layer of security began to crumble.',
     'scene',
     user_id,
     neon_city_id,
     nc_chapter1_id),
    ('Neon Rain',
     'The rain fell in sheets of purple and green, refracting the countless holograms that illuminated the city. From her perch fifty stories up, Jin watched the crowds below navigate the narrow streets, their umbrellas creating a kaleidoscope of color against the dark pavement.',
     'scene',
     user_id,
     neon_city_id,
     nc_chapter1_id);

  -- Neon City - Chapter 2
  INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
  VALUES (
    'Chapter 2: The Underground',
    'Exploring the hidden networks and secret societies that operate beneath the city''s glittering surface.',
    'chapter',
    user_id,
    neon_city_id,
    neon_root_id
  ) RETURNING id INTO nc_chapter2_id;

  -- Neon City - Chapter 2 Scenes
  INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
  VALUES
    ('The Meeting',
     'The Lucky Dragon was anything but lucky - a dive bar in the deepest level of the Underground, where the city''s artificial light never reached. Jin found her contact at the usual table, his cybernetic eyes glowing faintly in the darkness. "You''re late," he said, but they both knew timing didn''t matter down here where day and night were meaningless concepts.',
     'scene',
     user_id,
     neon_city_id,
     nc_chapter2_id),
    ('The Deal',
     'The data chip felt heavy in Jin''s hand, its surface smooth and cool against her palm. "This better be worth the risk," she said, sliding it across the table. Her contact smiled, revealing teeth lined with silver. "Oh, it is. This little piece of code is going to change everything."',
     'scene',
     user_id,
     neon_city_id,
     nc_chapter2_id);
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