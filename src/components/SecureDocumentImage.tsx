import { useState, useEffect } from 'react';
import { getSignedUrlFromPublicUrl } from '@/lib/storage';
import { Skeleton } from '@/components/ui/skeleton';

interface SecureDocumentImageProps {
  url: string | null;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
}

/**
 * Component that displays an image from the private storage bucket
 * using signed URLs for secure access.
 */
const SecureDocumentImage = ({ url, alt, className = '', fallback }: SecureDocumentImageProps) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadSignedUrl = async () => {
      if (!url) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(false);

      try {
        const signed = await getSignedUrlFromPublicUrl(url, 300); // 5 minutes
        if (signed) {
          setSignedUrl(signed);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error loading signed URL:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadSignedUrl();
  }, [url]);

  if (!url) {
    return fallback || <div className="bg-muted rounded-lg p-8 text-center text-sm">Não enviado</div>;
  }

  if (loading) {
    return <Skeleton className={`w-full h-48 ${className}`} />;
  }

  if (error || !signedUrl) {
    return (
      <div className="bg-destructive/10 rounded-lg p-8 text-center text-sm text-destructive">
        Erro ao carregar documento
      </div>
    );
  }

  return (
    <img 
      src={signedUrl} 
      alt={alt} 
      className={`${className}`}
      onError={() => setError(true)}
    />
  );
};

export default SecureDocumentImage;
