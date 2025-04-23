/*
  # Add sample content for specific user

  1. New Content
    - Three projects with rich content structure:
      - "The Enchanted Forest" (Fantasy)
      - "Murder at Midnight" (Mystery)
      - "Beyond the Stars" (Sci-Fi)
    - Each project has:
      - Multiple chapters
      - Nested scenes
      - Rich content examples
*/

-- First, clean up any existing content for this user
DELETE FROM documents WHERE owner_id = '580e3dd6-44dd-4ad8-a0c3-e02a9ec971fa';
DELETE FROM projects WHERE owner_id = '580e3dd6-44dd-4ad8-a0c3-e02a9ec971fa';

-- Create projects
WITH new_projects AS (
  INSERT INTO projects (id, title, description, owner_id, created_at, updated_at)
  VALUES
    -- The Enchanted Forest
    (
      gen_random_uuid(),
      'The Enchanted Forest',
      'A magical tale of discovery and wonder in an ancient forest where reality and fantasy intertwine.',
      '580e3dd6-44dd-4ad8-a0c3-e02a9ec971fa',
      NOW() - INTERVAL '5 days',
      NOW() - INTERVAL '1 day'
    ),
    -- Murder at Midnight
    (
      gen_random_uuid(),
      'Murder at Midnight',
      'A gripping detective story set in a small town where nothing is as it seems.',
      '580e3dd6-44dd-4ad8-a0c3-e02a9ec971fa',
      NOW() - INTERVAL '7 days',
      NOW() - INTERVAL '2 days'
    ),
    -- Beyond the Stars
    (
      gen_random_uuid(),
      'Beyond the Stars',
      'An epic space opera about humanity''s first contact with an advanced alien civilization.',
      '580e3dd6-44dd-4ad8-a0c3-e02a9ec971fa',
      NOW() - INTERVAL '3 days',
      NOW() - INTERVAL '12 hours'
    )
  RETURNING id, title
)
-- Create root documents for each project
INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
SELECT
  p.title,
  CASE 
    WHEN p.title = 'The Enchanted Forest' THEN 
      '# The Enchanted Forest

In the heart of an ancient woodland, where shadows dance with sunlight and whispers of magic echo through the leaves, lies a realm untouched by time. This is a story of wonder, courage, and the extraordinary power of believing in the impossible.'
    WHEN p.title = 'Murder at Midnight' THEN
      '# Murder at Midnight

The small town of Ravenwood seemed like any other quiet community, until the night that changed everything. As the clock struck midnight, a scream shattered the silence, and nothing would ever be the same.'
    ELSE
      '# Beyond the Stars

The year is 2247. Humanity has spread across the solar system, establishing colonies on Mars and the moons of Jupiter. But nothing could have prepared us for what we found in the depths of space.'
  END,
  'folder',
  '580e3dd6-44dd-4ad8-a0c3-e02a9ec971fa',
  p.id,
  NULL
FROM new_projects p;

-- Function to create chapters and scenes
CREATE OR REPLACE FUNCTION create_chapters_and_scenes(project_title text, project_id uuid, root_id uuid)
RETURNS void AS $$
DECLARE
  chapter_id uuid;
  subchapter_id uuid;
BEGIN
  IF project_title = 'The Enchanted Forest' THEN
    -- Chapter 1: The Ancient Path
    INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
    VALUES ('The Ancient Path', 'Deep in the heart of the forest, where the oldest trees whisper secrets of ages past.', 'folder', '580e3dd6-44dd-4ad8-a0c3-e02a9ec971fa', project_id, root_id)
    RETURNING id INTO chapter_id;

    -- Scenes for Chapter 1
    INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
    VALUES 
      ('First Steps', 'Lily stood at the edge of the forest, her heart pounding with anticipation. The ancient trees before her seemed to pulse with an otherworldly energy, their branches swaying in a wind that didn''t exist.', 'document', '580e3dd6-44dd-4ad8-a0c3-e02a9ec971fa', project_id, chapter_id),
      ('The Whispering Trees', 'The first whisper came so softly that Lily thought she had imagined it. But then another followed, and another, until the very air seemed alive with voices that spoke in languages long forgotten.', 'document', '580e3dd6-44dd-4ad8-a0c3-e02a9ec971fa', project_id, chapter_id);

    -- Chapter 2: The Guardian's Secret
    INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
    VALUES ('The Guardian''s Secret', 'Every forest has its protector, but some guardians hold secrets darker than the deepest shadows.', 'folder', '580e3dd6-44dd-4ad8-a0c3-e02a9ec971fa', project_id, root_id)
    RETURNING id INTO chapter_id;

    -- Subchapter: The Ancient Pact
    INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
    VALUES ('The Ancient Pact', 'Long ago, a promise was made between the guardians and the first settlers of the land.', 'folder', '580e3dd6-44dd-4ad8-a0c3-e02a9ec971fa', project_id, chapter_id)
    RETURNING id INTO subchapter_id;

    -- Scenes for The Ancient Pact
    INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
    VALUES 
      ('The Ritual', 'Under the light of the full moon, the guardian performed the ancient ritual that had kept the forest safe for centuries.', 'document', '580e3dd6-44dd-4ad8-a0c3-e02a9ec971fa', project_id, subchapter_id),
      ('The Price', 'Every magic has its cost, and the guardian''s power came with a terrible burden that would test the limits of sacrifice.', 'document', '580e3dd6-44dd-4ad8-a0c3-e02a9ec971fa', project_id, subchapter_id);

  ELSIF project_title = 'Murder at Midnight' THEN
    -- Chapter 1: The Body
    INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
    VALUES ('The Body', 'Detective Sarah Chen arrives at the scene of what appears to be a perfectly staged murder.', 'folder', '580e3dd6-44dd-4ad8-a0c3-e02a9ec971fa', project_id, root_id)
    RETURNING id INTO chapter_id;

    -- Scenes for Chapter 1
    INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
    VALUES 
      ('The Crime Scene', 'The victim lay in the center of the library, surrounded by a perfect circle of open books. Detective Chen had never seen anything like it in her fifteen years on the force.', 'document', '580e3dd6-44dd-4ad8-a0c3-e02a9ec971fa', project_id, chapter_id),
      ('First Impressions', 'Something about the scene felt wrong. The books, the position of the body, even the time of death - it was all too perfect, too deliberate.', 'document', '580e3dd6-44dd-4ad8-a0c3-e02a9ec971fa', project_id, chapter_id);

    -- Chapter 2: The Suspects
    INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
    VALUES ('The Suspects', 'Everyone in Ravenwood has something to hide, but only one person is a killer.', 'folder', '580e3dd6-44dd-4ad8-a0c3-e02a9ec971fa', project_id, root_id)
    RETURNING id INTO chapter_id;

    -- Subchapter: The Librarian
    INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
    VALUES ('The Librarian', 'Margaret Wells had worked at the library for forty years. She knew everyone''s secrets.', 'folder', '580e3dd6-44dd-4ad8-a0c3-e02a9ec971fa', project_id, chapter_id)
    RETURNING id INTO subchapter_id;

    -- Scenes for The Librarian
    INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
    VALUES 
      ('The Interview', 'Margaret sat perfectly straight in her chair, her gray hair pulled back in a severe bun. "The library holds many secrets," she said, "but murder isn''t one of them."', 'document', '580e3dd6-44dd-4ad8-a0c3-e02a9ec971fa', project_id, subchapter_id),
      ('Hidden Records', 'In the basement of the library, Detective Chen discovered a collection of private journals that told a very different story.', 'document', '580e3dd6-44dd-4ad8-a0c3-e02a9ec971fa', project_id, subchapter_id);

  ELSE -- Beyond the Stars
    -- Chapter 1: First Contact
    INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
    VALUES ('First Contact', 'The signal came from deep space, changing everything we thought we knew about our place in the universe.', 'folder', '580e3dd6-44dd-4ad8-a0c3-e02a9ec971fa', project_id, root_id)
    RETURNING id INTO chapter_id;

    -- Scenes for Chapter 1
    INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
    VALUES 
      ('The Signal', 'Dr. Elena Rodriguez stared at the data streaming across her screen, her coffee growing cold beside her. The pattern was unmistakable - this was no natural phenomenon.', 'document', '580e3dd6-44dd-4ad8-a0c3-e02a9ec971fa', project_id, chapter_id),
      ('Decryption', 'The alien message was elegant in its simplicity, yet the implications were staggering. They were coming, and they were bringing something with them.', 'document', '580e3dd6-44dd-4ad8-a0c3-e02a9ec971fa', project_id, chapter_id);

    -- Chapter 2: The Arrival
    INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
    VALUES ('The Arrival', 'As the alien ship enters our solar system, humanity faces its greatest challenge.', 'folder', '580e3dd6-44dd-4ad8-a0c3-e02a9ec971fa', project_id, root_id)
    RETURNING id INTO chapter_id;

    -- Subchapter: First Meeting
    INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
    VALUES ('First Meeting', 'The diplomatic team prepares for humanity''s first face-to-face encounter with an alien species.', 'folder', '580e3dd6-44dd-4ad8-a0c3-e02a9ec971fa', project_id, chapter_id)
    RETURNING id INTO subchapter_id;

    -- Scenes for First Meeting
    INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
    VALUES 
      ('Preparation', 'The team had trained for this moment for months, but nothing could truly prepare them for meeting beings from another world.', 'document', '580e3dd6-44dd-4ad8-a0c3-e02a9ec971fa', project_id, subchapter_id),
      ('The Exchange', 'When the alien delegates emerged from their ship, Dr. Rodriguez realized that all our assumptions about extraterrestrial life had been hopelessly naive.', 'document', '580e3dd6-44dd-4ad8-a0c3-e02a9ec971fa', project_id, subchapter_id);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create chapters and scenes for each project
DO $$
DECLARE
  project_record RECORD;
  root_document_id uuid;
BEGIN
  FOR project_record IN SELECT p.id, p.title, d.id as root_id 
    FROM projects p 
    JOIN documents d ON d.project_id = p.id 
    WHERE d.parent_id IS NULL 
    AND p.owner_id = '580e3dd6-44dd-4ad8-a0c3-e02a9ec971fa'
  LOOP
    PERFORM create_chapters_and_scenes(project_record.title, project_record.id, project_record.root_id);
  END LOOP;
END $$;

-- Clean up the temporary function
DROP FUNCTION create_chapters_and_scenes(text, uuid, uuid);