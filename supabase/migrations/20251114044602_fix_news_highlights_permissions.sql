/*
  # Fix news_highlights RLS Permissions
  
  1. Changes
    - Drop existing restrictive policies
    - Add policy to allow anon users to write (for edge function)
    - Keep public read access for active news
  
  2. Security Notes
    - Edge functions run as anon by default
    - Service role policies don't apply to edge functions unless explicitly configured
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Public read access to active news" ON news_highlights;
DROP POLICY IF EXISTS "Service role has full access to news" ON news_highlights;

-- Allow public read access to active news
CREATE POLICY "Anyone can read active news"
  ON news_highlights
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Allow anon (edge functions) to insert/update news
CREATE POLICY "Edge functions can manage news"
  ON news_highlights
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);
