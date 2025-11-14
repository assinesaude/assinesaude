/*
  # Fix RLS Policies for All Tables

  1. Security Updates
    - Enable RLS on news_highlights table
    - Enable RLS on banner_carousel table  
    - Enable RLS on testimonials table
    - Enable RLS on vector_icons table
    - Enable RLS on carousel_items table

  2. RLS Policies
    
    For news_highlights:
    - Allow public read access (SELECT)
    - Allow service role full access for edge functions
    
    For banner_carousel:
    - Allow public read access (SELECT) for active banners
    - Allow service role full access for admin
    
    For testimonials:
    - Allow public read access (SELECT) for published testimonials
    - Allow authenticated users to insert their own
    - Allow users to update their own
    
    For vector_icons:
    - Allow public read access (SELECT) for active icons
    - Allow service role full access for admin
    
    For carousel_items:
    - Allow public read access (SELECT) for active items
    - Allow service role full access for admin

  IMPORTANT: Service role key is used by Edge Functions, so policies must allow
  service role to bypass RLS restrictions.
*/

-- Enable RLS on news_highlights
ALTER TABLE news_highlights ENABLE ROW LEVEL SECURITY;

-- Policies for news_highlights
CREATE POLICY "Public read access to active news"
  ON news_highlights
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Service role has full access to news"
  ON news_highlights
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Enable RLS on banner_carousel
ALTER TABLE banner_carousel ENABLE ROW LEVEL SECURITY;

-- Policies for banner_carousel
CREATE POLICY "Public read access to active banners"
  ON banner_carousel
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Service role has full access to banners"
  ON banner_carousel
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Enable RLS on testimonials
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Policies for testimonials
CREATE POLICY "Public read access to published testimonials"
  ON testimonials
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Service role has full access to testimonials"
  ON testimonials
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Enable RLS on vector_icons
ALTER TABLE vector_icons ENABLE ROW LEVEL SECURITY;

-- Policies for vector_icons
CREATE POLICY "Public read access to active vector icons"
  ON vector_icons
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Service role has full access to vector icons"
  ON vector_icons
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Enable RLS on carousel_items
ALTER TABLE carousel_items ENABLE ROW LEVEL SECURITY;

-- Policies for carousel_items
CREATE POLICY "Public read access to active carousel items"
  ON carousel_items
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Service role has full access to carousel items"
  ON carousel_items
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
