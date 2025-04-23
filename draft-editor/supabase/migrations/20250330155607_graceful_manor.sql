/*
  # Update sample data for specific user

  1. Changes
    - Remove existing sample data
    - Create new sample projects with specific owner_id
    - Add structured chapters and scenes
*/

-- First, clean up existing sample data
DELETE FROM documents;
DELETE FROM projects;

-- Create new sample projects for the specific user
WITH new_projects AS (
  INSERT INTO projects (id, title, description, owner_id, created_at, updated_at)
  VALUES
    -- The Lost City
    (
      gen_random_uuid(),
      'The Lost City',
      'An archaeological adventure novel about the discovery of an ancient civilization hidden deep in the Amazon rainforest.',
      '64be9271-5f61-4808-87e1-5045f12a1239',
      NOW() - INTERVAL '5 days',
      NOW() - INTERVAL '1 day'
    ),
    -- Echoes of Tomorrow
    (
      gen_random_uuid(),
      'Echoes of Tomorrow',
      'A science fiction story exploring the consequences of time travel and the ethical dilemmas it presents.',
      '64be9271-5f61-4808-87e1-5045f12a1239',
      NOW() - INTERVAL '7 days',
      NOW() - INTERVAL '2 days'
    ),
    -- The Coffee Shop
    (
      gen_random_uuid(),
      'The Coffee Shop',
      'A cozy romance novel set in a charming neighborhood café where unexpected connections bloom over perfectly brewed coffee.',
      '64be9271-5f61-4808-87e1-5045f12a1239',
      NOW() - INTERVAL '3 days',
      NOW() - INTERVAL '12 hours'
    )
  RETURNING id, title
)
-- Create root documents and chapters for each project
INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
SELECT
  p.title,
  CASE 
    WHEN p.title = 'The Lost City' THEN 
      'Deep in the heart of the Amazon, where ancient secrets lie buried beneath centuries of growth, an expedition team makes a discovery that will change our understanding of human history forever.'
    WHEN p.title = 'Echoes of Tomorrow' THEN
      'In 2157, time travel is no longer a dream but a carefully regulated reality. When a temporal anomaly threatens the fabric of spacetime, one researcher must confront the consequences of her own discoveries.'
    ELSE
      'The Moonbeam Café sits on the corner of Oak and Main, its windows steamed with the promise of warmth and the aroma of freshly ground coffee beans. For barista Sophie Chen, it''s more than just a workplace—it''s where her story begins.'
  END,
  'folder',
  '64be9271-5f61-4808-87e1-5045f12a1239',
  p.id,
  NULL
FROM new_projects p;

-- Function to create chapters and scenes
CREATE OR REPLACE FUNCTION create_chapters_and_scenes(project_title text, project_id uuid, root_id uuid)
RETURNS void AS $$
DECLARE
  chapter_id uuid;
BEGIN
  IF project_title = 'The Lost City' THEN
    -- Chapter 1: The Discovery
    INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
    VALUES ('The Discovery', 'The first signs of the lost city emerge from the dense jungle canopy.', 'folder', '64be9271-5f61-4808-87e1-5045f12a1239', project_id, root_id)
    RETURNING id INTO chapter_id;

    -- Scenes for Chapter 1
    INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
    VALUES 
      ('Satellite Anomaly', 'Dr. Sarah Martinez squinted at her computer screen, her coffee growing cold beside her. The satellite imagery showed something unusual—geometric patterns where there should only be unbroken rainforest.', 'document', '64be9271-5f61-4808-87e1-5045f12a1239', project_id, chapter_id),
      ('The Expedition Begins', 'The helicopter touched down in a small clearing, its rotors whipping the surrounding vegetation into a frenzy. Sarah checked her equipment one last time as the team prepared to set out on foot.', 'document', '64be9271-5f61-4808-87e1-5045f12a1239', project_id, chapter_id),
      ('First Contact', 'They found the first stone marker just before sunset. Ancient symbols, worn but still visible, covered its surface. "This changes everything," Sarah whispered, running her fingers over the engravings.', 'document', '64be9271-5f61-4808-87e1-5045f12a1239', project_id, chapter_id);

    -- Chapter 2: Ancient Secrets
    INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
    VALUES ('Ancient Secrets', 'The team uncovers evidence of an advanced civilization that challenges historical records.', 'folder', '64be9271-5f61-4808-87e1-5045f12a1239', project_id, root_id)
    RETURNING id INTO chapter_id;

    -- Scenes for Chapter 2
    INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
    VALUES 
      ('The Archive', 'The chamber was vast, its walls lined with what appeared to be metal scrolls. "Impossible," Dr. Chen muttered, "This level of metallurgy shouldn''t exist in pre-Columbian America."', 'document', '64be9271-5f61-4808-87e1-5045f12a1239', project_id, chapter_id),
      ('Decoding the Past', 'Sarah''s team worked through the night, documenting and photographing every inch of the archive. The symbols matched no known writing system, yet they held a mathematical precision that hinted at their meaning.', 'document', '64be9271-5f61-4808-87e1-5045f12a1239', project_id, chapter_id);

  ELSIF project_title = 'Echoes of Tomorrow' THEN
    -- Chapter 1: The Anomaly
    INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
    VALUES ('The Anomaly', 'A disturbance in the temporal field threatens the stability of the timeline.', 'folder', '64be9271-5f61-4808-87e1-5045f12a1239', project_id, root_id)
    RETURNING id INTO chapter_id;

    -- Scenes for Chapter 1
    INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
    VALUES 
      ('Warning Signs', 'The temporal monitors lit up like a Christmas tree, their normally steady rhythms now a chaotic dance of red and amber alerts. Dr. Maya Patel felt her heart skip a beat—in fifteen years of temporal research, she''d never seen anything like this.', 'document', '64be9271-5f61-4808-87e1-5045f12a1239', project_id, chapter_id),
      ('Protocol Breach', 'The security alarms blared through the facility. Someone had initiated an unauthorized jump sequence. Maya rushed to the control room, already knowing who it had to be.', 'document', '64be9271-5f61-4808-87e1-5045f12a1239', project_id, chapter_id);

    -- Chapter 2: Temporal Consequences
    INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
    VALUES ('Temporal Consequences', 'The ripple effects of time travel begin to manifest in unexpected ways.', 'folder', '64be9271-5f61-4808-87e1-5045f12a1239', project_id, root_id)
    RETURNING id INTO chapter_id;

    -- Scenes for Chapter 2
    INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
    VALUES 
      ('The First Wave', 'It started with small things—a coffee cup that was suddenly empty, a pen that had never been uncapped. Maya documented each change, watching as reality slowly rewrote itself around them.', 'document', '64be9271-5f61-4808-87e1-5045f12a1239', project_id, chapter_id),
      ('Memory Lane', 'The temporal shield hummed softly as Maya reviewed the logs. According to the data, she had lived this day three times already. The thought made her head spin.', 'document', '64be9271-5f61-4808-87e1-5045f12a1239', project_id, chapter_id);

  ELSE -- The Coffee Shop
    -- Chapter 1: Morning Rush
    INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
    VALUES ('Morning Rush', 'The daily rhythm of the café sets the stage for unexpected encounters.', 'folder', '64be9271-5f61-4808-87e1-5045f12a1239', project_id, root_id)
    RETURNING id INTO chapter_id;

    -- Scenes for Chapter 1
    INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
    VALUES 
      ('The Perfect Brew', 'Sophie adjusted the grind size one more time, determined to get it just right. The morning sun painted the café in warm golden light as she prepared for another day of creating liquid perfection.', 'document', '64be9271-5f61-4808-87e1-5045f12a1239', project_id, chapter_id),
      ('The Regular', 'He came in every morning at exactly 7:45, ordered the same thing—a medium Americano with an extra shot—and always sat by the window. Sophie had never caught his name, but she''d memorized his smile.', 'document', '64be9271-5f61-4808-87e1-5045f12a1239', project_id, chapter_id);

    -- Chapter 2: Spilled Coffee
    INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
    VALUES ('Spilled Coffee', 'An accident leads to an unexpected connection.', 'folder', '64be9271-5f61-4808-87e1-5045f12a1239', project_id, root_id)
    RETURNING id INTO chapter_id;

    -- Scenes for Chapter 2
    INSERT INTO documents (title, content, type, owner_id, project_id, parent_id)
    VALUES 
      ('The Incident', 'The cup slipped, coffee splashing across his pristine white shirt. Time seemed to freeze as Sophie watched the disaster unfold in slow motion.', 'document', '64be9271-5f61-4808-87e1-5045f12a1239', project_id, chapter_id),
      ('Aftermath', '"I''m so sorry," Sophie grabbed a handful of napkins, mortified. But when their eyes met, he was smiling. "I''m David," he said, "and I think you owe me a coffee."', 'document', '64be9271-5f61-4808-87e1-5045f12a1239', project_id, chapter_id);
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
    AND p.owner_id = '64be9271-5f61-4808-87e1-5045f12a1239'
  LOOP
    PERFORM create_chapters_and_scenes(project_record.title, project_record.id, project_record.root_id);
  END LOOP;
END $$;

-- Clean up the temporary function
DROP FUNCTION create_chapters_and_scenes(text, uuid, uuid);