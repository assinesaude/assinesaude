-- Create storage bucket for professional documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('professional-documents', 'professional-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own documents
CREATE POLICY "Users can upload their own documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'professional-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to update their own documents
CREATE POLICY "Users can update their own documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'professional-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access to documents (for admin viewing)
CREATE POLICY "Documents are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'professional-documents');