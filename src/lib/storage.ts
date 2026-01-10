import { supabase } from '@/integrations/supabase/client';

/**
 * Get a signed URL for a private file in the professional-documents bucket.
 * The URL expires after the specified time (default 60 seconds).
 */
export const getSignedUrl = async (filePath: string, expiresIn: number = 60): Promise<string | null> => {
  try {
    // Extract just the path from a full URL if needed
    let cleanPath = filePath;
    if (filePath.includes('/professional-documents/')) {
      const parts = filePath.split('/professional-documents/');
      cleanPath = parts[parts.length - 1];
    }

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error('No session found for signed URL request');
      return null;
    }

    const response = await supabase.functions.invoke('get-signed-url', {
      body: { filePath: cleanPath, expiresIn },
    });

    if (response.error) {
      console.error('Error getting signed URL:', response.error);
      return null;
    }

    return response.data?.signedUrl || null;
  } catch (error) {
    console.error('Error in getSignedUrl:', error);
    return null;
  }
};

/**
 * Convert a public URL to a signed URL for private access.
 * Use this when displaying documents that were stored with public URLs
 * but are now in a private bucket.
 */
export const getSignedUrlFromPublicUrl = async (publicUrl: string | null, expiresIn: number = 300): Promise<string | null> => {
  if (!publicUrl) return null;
  
  // If it's not a storage URL, return as-is (might be an external URL)
  if (!publicUrl.includes('/storage/v1/object/public/professional-documents/')) {
    return publicUrl;
  }

  // Extract the file path from the public URL
  const parts = publicUrl.split('/storage/v1/object/public/professional-documents/');
  if (parts.length < 2) return publicUrl;

  const filePath = parts[1];
  return getSignedUrl(filePath, expiresIn);
};
