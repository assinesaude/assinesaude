/*
  # Create News Highlights Table

  1. New Tables
    - `news_highlights`
      - `id` (uuid, primary key)
      - `image_url` (text) - URL da imagem de destaque
      - `title` (text) - Título principal em destaque
      - `subtitle` (text) - Breve resumo/subtítulo
      - `article_url` (text) - URL do artigo original (para notícias do Health News Today)
      - `source` (text) - Origem do destaque: 'admin' ou 'healthnews'
      - `display_order` (integer) - Ordem de exibição no carrossel (1-10)
      - `is_active` (boolean) - Se está ativo para exibição
      - `last_fetched_at` (timestamptz) - Última vez que foi atualizado automaticamente
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `news_highlights` table
    - Add policy for public read access (anyone can view active highlights)
    - Add policy for admin insert/update/delete (authenticated users only)
  
  3. Indexes
    - Add index on display_order for faster sorting
    - Add index on is_active for filtering active highlights
    - Add index on source for filtering by source type
*/

CREATE TABLE IF NOT EXISTS news_highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  title text NOT NULL,
  subtitle text NOT NULL,
  article_url text,
  source text DEFAULT 'admin',
  display_order integer NOT NULL DEFAULT 1,
  is_active boolean DEFAULT true,
  last_fetched_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE news_highlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active news highlights"
  ON news_highlights
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert news highlights"
  ON news_highlights
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update news highlights"
  ON news_highlights
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete news highlights"
  ON news_highlights
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_news_highlights_order ON news_highlights(display_order);
CREATE INDEX IF NOT EXISTS idx_news_highlights_active ON news_highlights(is_active);
CREATE INDEX IF NOT EXISTS idx_news_highlights_source ON news_highlights(source);
