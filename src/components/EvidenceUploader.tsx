import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Trash2, X, RefreshCw, AlertCircle } from 'lucide-react';
import { Parallelogram } from './Parallelogram';
import { MediaPreview } from './MediaPreview';
import { storageService } from '../services';
import { validateMediaFile, fileToDataUrl, MAX_EVIDENCE_FILES } from '../utils/mediaUtils';

interface EvidenceUploaderProps {
  evidence: string[];
  onChange: (evidence: string[]) => void;
  category: string; // Used to pick appropriate mock photo
}

const MOCK_PHOTOS_BY_CATEGORY: Record<string, string> = {
  'Roads & Public Spaces': 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=600&auto=format&fit=crop',
  'Water & Drainage': 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=600&auto=format&fit=crop',
  'Waste & Sanitation': 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?q=80&w=600&auto=format&fit=crop',
  'Electricity': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600&auto=format&fit=crop',
  'default': 'https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=600&auto=format&fit=crop'
};

export const EvidenceUploader: React.FC<EvidenceUploaderProps> = ({
  evidence,
  onChange,
  category
}) => {
  const [showCamera, setShowCamera] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track created blob URLs for automatic revocation
  const activeBlobUrls = useRef<Set<string>>(new Set());

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    const urls = activeBlobUrls.current;
    return () => {
      urls.forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          console.warn('Error revoking blob URL:', e);
        }
      });
      urls.clear();
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setValidationError(null);
    const fileList = Array.from(files);

    // 1. Check max files count
    if (evidence.length + fileList.length > MAX_EVIDENCE_FILES) {
      setValidationError(`You can attach up to ${MAX_EVIDENCE_FILES} evidence files in total.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. Validate format and size for each file
    const validFiles: File[] = [];
    for (const file of fileList) {
      const result = validateMediaFile(file);
      if (!result.valid) {
        setValidationError(result.error || 'Invalid file selected.');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      validFiles.push(file);
    }

    setIsUploading(true);
    try {
      // If cloud storage is available, upload directly.
      // Otherwise convert to Data URL for prototype persistence across reloads.
      const persistentUrls = await Promise.all(
        validFiles.map(async (file) => {
          try {
            return await storageService.uploadFile(file, 'grievance-evidence');
          } catch {
            return await fileToDataUrl(file);
          }
        })
      );

      // Track blob URLs if any were returned
      persistentUrls.forEach(url => {
        if (url.startsWith('blob:')) {
          activeBlobUrls.current.add(url);
        }
      });

      onChange([...evidence, ...persistentUrls]);
    } catch (err) {
      console.error('Evidence upload error:', err);
      // Temporary fallback preview
      const fallbackUrls = validFiles.map(file => {
        const objUrl = URL.createObjectURL(file);
        activeBlobUrls.current.add(objUrl);
        return objUrl;
      });
      onChange([...evidence, ...fallbackUrls]);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerUploadClick = () => {
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    const targetUrl = evidence[indexToRemove];
    if (targetUrl && targetUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(targetUrl);
        activeBlobUrls.current.delete(targetUrl);
      } catch (e) {
        console.warn('Error revoking blob URL on remove:', e);
      }
    }

    const filtered = evidence.filter((_, idx) => idx !== indexToRemove);
    onChange(filtered);
  };

  const handleStartCamera = () => {
    setValidationError(null);
    setShowCamera(true);
    setCameraLoading(true);
    setTimeout(() => {
      setCameraLoading(false);
    }, 800);
  };

  const handleCapturePhoto = () => {
    const mockPhotoUrl = MOCK_PHOTOS_BY_CATEGORY[category] || MOCK_PHOTOS_BY_CATEGORY.default;
    onChange([...evidence, mockPhotoUrl]);
    setShowCamera(false);
  };

  return (
    <div style={{ marginTop: '0.5rem' }}>
      {/* Validation Error Alert */}
      {validationError && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '8px',
          padding: '0.6rem 0.8rem',
          color: '#F87171',
          fontSize: '0.75rem',
          marginBottom: '0.8rem'
        }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{validationError}</span>
        </div>
      )}

      {/* Previews Grid */}
      {evidence.length > 0 && (
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {evidence.map((src, index) => (
            <div 
              key={index}
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '8px',
                border: '1.5px solid var(--color-border)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                backgroundColor: '#1E293B'
              }}
            >
              <MediaPreview 
                src={src} 
                alt={`Evidence ${index + 1}`} 
              />
              <button
                type="button"
                onClick={() => handleRemovePhoto(index)}
                aria-label={`Remove evidence ${index + 1}`}
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  backgroundColor: 'rgba(239, 68, 68, 0.9)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '50%',
                  width: '22px',
                  height: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  zIndex: 2
                }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      {!showCamera && (
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          {/* File Upload Hidden */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,video/*"
            style={{ display: 'none' }}
            multiple
          />

          <Parallelogram
            onClick={handleStartCamera}
            style={{
              background: '#FFFFFF',
              border: '1.5px dashed var(--color-primary)',
              cursor: 'pointer',
              padding: '1rem',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              color: 'var(--color-primary)'
            }}
          >
            <Camera size={24} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Simulate Camera</span>
          </Parallelogram>

          <Parallelogram
            onClick={triggerUploadClick}
            style={{
              background: '#FFFFFF',
              border: '1.5px solid var(--color-border)',
              cursor: 'pointer',
              padding: '1rem',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              color: 'var(--color-text-muted)'
            }}
          >
            <Upload size={24} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              {isUploading ? 'Uploading...' : 'Upload File'}
            </span>
          </Parallelogram>
        </div>
      )}

      {/* Camera Simulator Overlay */}
      {showCamera && (
        <div style={{
          backgroundColor: '#0F172A',
          borderRadius: '8px',
          padding: '1.5rem',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          border: '2px solid var(--color-primary)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary-light)' }}>
              CAMERA VIEWFINDER
            </span>
            <button
              type="button"
              onClick={() => setShowCamera(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Viewfinder screen */}
          <div style={{
            width: '100%',
            height: '180px',
            border: '2px dashed #475569',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            backgroundColor: '#1E293B'
          }}>
            {cameraLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <RefreshCw size={24} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Loading lens...</span>
              </div>
            ) : (
              <>
                {/* Viewfinder crosshairs */}
                <div style={{
                  position: 'absolute',
                  width: '30px',
                  height: '30px',
                  border: '1.5px solid rgba(255,255,255,0.4)',
                  borderRadius: '50%'
                }} />
                <span style={{ fontSize: '0.75rem', color: '#94A3B8', textAlign: 'center', padding: '0 1rem' }}>
                  Point camera at problem and click shutter.<br />
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-border)' }}>
                    (Capturing for: {category})
                  </span>
                </span>
              </>
            )}
          </div>

          {/* Capture Trigger */}
          <button
            type="button"
            disabled={cameraLoading}
            onClick={handleCapturePhoto}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              border: '4px solid var(--color-primary)',
              cursor: cameraLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
              transition: 'transform 0.1s'
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#EF4444',
            }} />
          </button>
        </div>
      )}
    </div>
  );
};
