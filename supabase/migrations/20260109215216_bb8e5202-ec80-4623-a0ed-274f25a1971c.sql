-- Tornar o bucket de documentos públicos para visualização
UPDATE storage.buckets 
SET public = true 
WHERE id = 'professional-documents';