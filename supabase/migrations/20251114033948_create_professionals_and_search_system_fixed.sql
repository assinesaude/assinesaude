/*
  # Create Professionals Directory and Search Limit System

  ## 1. New Tables
  
  ### `professionals_directory`
  Directory of healthcare professionals searchable by TERVIS.AI
  - `id` (uuid, primary key)
  - `full_name` (text) - Professional's full name
  - `specialty` (text) - Medical specialty (e.g., Dentista, Psicólogo)
  - `crm_number` (text) - Professional registration number
  - `city` (text) - City where they practice
  - `state` (text) - State abbreviation (BA, SP, RJ, etc)
  - `address` (text) - Full address
  - `phone` (text) - Contact phone
  - `email` (text) - Contact email
  - `bio` (text) - Professional bio/description
  - `services` (text[]) - Array of services offered
  - `accepts_plans` (text[]) - Health insurance plans accepted
  - `price_range` (text) - Price indication (e.g., "R$ 100-200")
  - `is_registered` (boolean) - If professional has active account
  - `profile_id` (uuid, nullable) - Link to profiles table if registered
  - `photo_url` (text) - Profile photo URL
  - `rating` (numeric) - Average rating (0-5)
  - `total_reviews` (integer) - Number of reviews
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `search_usage_limits`
  Track daily search usage for rate limiting
  - `id` (uuid, primary key)
  - `user_id` (uuid) - User making searches
  - `date` (date) - Date of searches
  - `search_count` (integer) - Number of searches made
  - `last_search_at` (timestamptz) - Last search timestamp
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## 2. Security
  - Enable RLS on both tables
  - Public can read professionals_directory
  - Only admins can modify professionals_directory
  - Users can read their own search_usage_limits
  - Service role has full access for search operations

  ## 3. Indexes
  - Index on specialty and location for fast searches
  - Index on user_id and date for rate limiting
  - Full text search index on professional data
*/

-- Create professionals_directory table
CREATE TABLE IF NOT EXISTS professionals_directory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  specialty text NOT NULL,
  crm_number text,
  city text NOT NULL,
  state text NOT NULL,
  address text,
  phone text,
  email text,
  bio text,
  services text[] DEFAULT ARRAY[]::text[],
  accepts_plans text[] DEFAULT ARRAY[]::text[],
  price_range text,
  is_registered boolean DEFAULT false,
  profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  photo_url text,
  rating numeric(3,2) DEFAULT 0,
  total_reviews integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create search_usage_limits table
CREATE TABLE IF NOT EXISTS search_usage_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  search_count integer DEFAULT 0,
  last_search_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE professionals_directory ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_usage_limits ENABLE ROW LEVEL SECURITY;

-- Policies for professionals_directory
CREATE POLICY "Anyone can view professionals directory"
  ON professionals_directory
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can insert professionals"
  ON professionals_directory
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

CREATE POLICY "Admins can update professionals"
  ON professionals_directory
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

CREATE POLICY "Admins can delete professionals"
  ON professionals_directory
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

CREATE POLICY "Service role has full access to professionals"
  ON professionals_directory
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policies for search_usage_limits
CREATE POLICY "Users can view own search limits"
  ON search_usage_limits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role has full access to search limits"
  ON search_usage_limits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_professionals_specialty ON professionals_directory(specialty);
CREATE INDEX IF NOT EXISTS idx_professionals_city ON professionals_directory(city);
CREATE INDEX IF NOT EXISTS idx_professionals_state ON professionals_directory(state);
CREATE INDEX IF NOT EXISTS idx_professionals_city_state ON professionals_directory(city, state);
CREATE INDEX IF NOT EXISTS idx_professionals_is_registered ON professionals_directory(is_registered);

CREATE INDEX IF NOT EXISTS idx_search_limits_user_date ON search_usage_limits(user_id, date);

-- Create full text search index for professionals
CREATE INDEX IF NOT EXISTS idx_professionals_search 
  ON professionals_directory 
  USING gin(to_tsvector('portuguese', 
    coalesce(full_name, '') || ' ' || 
    coalesce(specialty, '') || ' ' || 
    coalesce(city, '') || ' ' || 
    coalesce(bio, '')
  ));

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_professionals_directory_updated_at ON professionals_directory;
CREATE TRIGGER update_professionals_directory_updated_at
  BEFORE UPDATE ON professionals_directory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_search_usage_limits_updated_at ON search_usage_limits;
CREATE TRIGGER update_search_usage_limits_updated_at
  BEFORE UPDATE ON search_usage_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
