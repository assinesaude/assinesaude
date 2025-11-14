/*
  # Fix Banner Carousel RLS for Anonymous Access

  1. Changes
    - Drop existing restrictive policy
    - Add new policy that allows anonymous (anon) users to view active banners
    - Ensure public access to banner carousel data
*/

-- Drop the existing public policy
DROP POLICY IF EXISTS "Anyone can view active banners" ON banner_carousel;

-- Create a new policy that explicitly allows anon role
CREATE POLICY "Allow anonymous users to view active banners"
  ON banner_carousel
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);
