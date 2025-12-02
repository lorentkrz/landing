-- First, let's check your existing table structures
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name IN ('venues', 'profiles', 'check_ins') 
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;
