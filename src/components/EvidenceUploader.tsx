import React, { useState, useRef } from 'react';
import { Camera, Upload, Trash2, X, RefreshCw } from 'lucide-react';
import { Parallelogram } from './Parallelogram';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    
    // Convert to dummy URLs for local state preview
    const urls = fileList.map(file => URL.createObjectURL(file));
    onChange([...evidence, ...urls]);
  };

  const triggerUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    const filtered = evidence.filter((_, idx) => idx !== indexToRemove);
    onChange(filtered);
  };

  const handleStartCamera = () => {
    setShowCamera(true);
    setCameraLoading(true);
    // Simulate camera starting up
    setTimeout(() => {
      setCameraLoading(false);
    }, 800);
  };

  const handleCapturePhoto = () => {
    // Select mock image depending on complaint category
    const mockPhotoUrl = MOCK_PHOTOS_BY_CATEGORY[category] || MOCK_PHOTOS_BY_CATEGORY.default;
    
    onChange([...evidence, mockPhotoUrl]);
    setShowCamera(false);
  };

  return (
    <div style={{ marginTop: '0.5rem' }}>
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
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
            >
              <img 
                src={src} 
                alt={`Evidence ${index + 1}`} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              <button
                type="button"
                onClick={() => handleRemovePhoto(index)}
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
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Upload File</span>
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
