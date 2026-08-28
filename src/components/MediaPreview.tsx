import React from 'react';
import { Play } from 'lucide-react';
import { isVideoEvidence } from '../utils/mediaUtils';

interface MediaPreviewProps {
  src: string;
  alt?: string;
  style?: React.CSSProperties;
  showControls?: boolean;
  className?: string;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({
  src,
  alt = 'Evidence preview',
  style,
  showControls = false,
  className
}) => {
  const isVideo = isVideoEvidence(src);

  if (isVideo) {
    if (showControls) {
      return (
        <video
          src={src}
          controls
          playsInline
          className={className}
          style={{ width: '100%', height: '100%', objectFit: 'cover', ...style }}
        />
      );
    }

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', ...style }}>
        <video
          src={src}
          muted
          playsInline
          preload="metadata"
          className={className}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF'
          }}
        >
          <Play size={18} fill="#FFFFFF" />
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{ width: '100%', height: '100%', objectFit: 'cover', ...style }}
    />
  );
};
