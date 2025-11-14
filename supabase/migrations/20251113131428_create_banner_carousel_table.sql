/*
  # Create Banner Carousel Table

  1. New Tables
    - `banner_carousel`
      - `id` (uuid, primary key) - Unique identifier
      - `title` (text) - Banner title for admin reference
      - `media_url` (text) - URL to image or video
      - `media_type` (text) - Type: 'image' or 'video'
      - `link_url` (text, nullable) - Optional clickable link
      - `display_order` (integer) - Order of display
      - `is_active` (boolean) - Whether banner is active
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `banner_carousel` table
    - Add policy for public read access (anyone can view active banners)
    - Add policy for authenticated admin users to manage banners
*/

CREATE TABLE IF NOT EXISTS banner_carousel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  media_url text NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('image', 'video')),
  link_url text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE banner_carousel ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active banners"
  ON banner_carousel
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can view all banners"
  ON banner_carousel
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert banners"
  ON banner_carousel
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update banners"
  ON banner_carousel
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete banners"
  ON banner_carousel
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_banner_carousel_active ON banner_carousel(is_active, display_order);
