-- Drop all tables in reverse order of dependencies
-- CASCADE will automatically drop dependent objects

DROP TABLE IF EXISTS analysis_results CASCADE;
DROP TABLE IF EXISTS analysis_steps CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS analysis CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop the update_updated_at_column function if it exists
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
