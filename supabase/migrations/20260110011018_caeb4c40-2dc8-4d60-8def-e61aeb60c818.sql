-- Drop any existing policies on storage.objects for professional-documents
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update coupons" ON public.discount_coupons;
DROP POLICY IF EXISTS "Admins can delete coupons" ON public.discount_coupons;
DROP POLICY IF EXISTS "Admins can insert coupons" ON public.discount_coupons;

-- Recreate the missing policies
-- Users can update their own documents
CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'professional-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own documents
CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'professional-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Admins can insert coupons
CREATE POLICY "Admins can insert coupons"
ON public.discount_coupons FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can update coupons
CREATE POLICY "Admins can update coupons"
ON public.discount_coupons FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete coupons
CREATE POLICY "Admins can delete coupons"
ON public.discount_coupons FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));