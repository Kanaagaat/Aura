import { useState } from 'react';
import clsx from 'clsx';
import { resolvePhotoUrl } from '../lib/media';

interface LocationImageProps {
  src?: string | null;
  alt: string;
  category?: string;
  className?: string;
}

export function LocationImage({ src, alt, category = 'other', className }: LocationImageProps) {
  const [failed, setFailed] = useState(false);
  const resolved = resolvePhotoUrl(src, category);

  return (
    <img
      src={failed ? resolvePhotoUrl(null, category) : resolved}
      alt={alt}
      className={clsx('object-cover', className)}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}
