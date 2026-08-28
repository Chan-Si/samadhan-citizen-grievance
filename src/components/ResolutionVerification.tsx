import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, HelpCircle, CheckCircle } from 'lucide-react';
import type { CitizenVerificationStatus } from '../types';
import { Parallelogram } from './Parallelogram';
import { EvidenceUploader } from './EvidenceUploader';

interface ResolutionVerificationProps {
  onVerify: (status: CitizenVerificationStatus, comment?: string, photo?: string) => void;
  currentVerification: CitizenVerificationStatus;
}

export const ResolutionVerification: React.FC<ResolutionVerificationProps> = ({
  onVerify,
  currentVerification
}) => {
  const [selectedOpt, setSelectedOpt] = useState<CitizenVerificationStatus>('None');
  const [comment, setComment] = useState('');
  const [photo, setPhoto] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(currentVerification !== 'None');

  const handleOptionClick = (opt: CitizenVerificationStatus) => {
    setSelectedOpt(opt);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOpt === 'None') return;

    onVerify(selectedOpt, comment, photo[0] || undefined);
    setSubmitted(true);
  };

  if (submitted || currentVerification !== 'None') {
    const activeVerif = currentVerification !== 'None' ? currentVerification : selectedOpt;
    return (
      <div style={{
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        border: '1.5px solid #10B981',
        borderRadius: '12px',
        padding: '1.2rem',
        textAlign: 'center',
        marginTop: '1rem'
      }}>
        <CheckCircle size={32} style={{ color: '#10B981', margin: '0 auto 0.5rem auto' }} />
        <h4 style={{ color: '#FFFFFF', marginBottom: '0.4rem', fontSize: '1rem' }}>
          {activeVerif === 'VerifiedFixed' && 'Resolution Verified'}
          {activeVerif === 'PartiallyFixed' && 'Feedback Submitted: Partially Fixed'}
          {activeVerif === 'NotFixed' && 'Review Requested: Still Unresolved'}
        </h4>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-on-card-muted)', margin: 0 }}>
          {activeVerif === 'VerifiedFixed' && 'Thank you for confirming that the issue has been successfully resolved.'}
          {activeVerif === 'PartiallyFixed' && 'You reported the issue as partially fixed. Our inspection team will look into your comments.'}
          {activeVerif === 'NotFixed' && 'Your dispute has been logged. The complaint has been sent back for department review.'}
        </p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      border: '1.5px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '1.5rem',
      marginTop: '1.5rem'
    }}>
      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <HelpCircle size={20} />
        Can you confirm that the problem is actually fixed?
      </h3>
      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-on-card-muted)', marginBottom: '1.2rem' }}>
        A complaint should not simply close because the department claims it is done. Please tell us the ground reality.
      </p>

      {/* Action buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem', marginBottom: '1.2rem' }}>
        <Parallelogram
          onClick={() => handleOptionClick('VerifiedFixed')}
          style={{
            background: selectedOpt === 'VerifiedFixed' ? 'var(--color-resolved-bg)' : 'rgba(0, 0, 0, 0.2)',
            border: selectedOpt === 'VerifiedFixed' ? '1.5px solid #10B981' : '1px solid rgba(255, 255, 255, 0.1)',
            cursor: 'pointer',
            padding: '0.8rem 0.4rem',
            height: '100%',
            borderRadius: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', height: '100%' }}>
            <ThumbsUp size={18} style={{ color: selectedOpt === 'VerifiedFixed' ? 'var(--color-resolved-text)' : 'var(--color-text-on-card-muted)', flexShrink: 0 }} />
            <span style={{ 
              fontSize: '0.75rem', 
              fontWeight: 600, 
              color: selectedOpt === 'VerifiedFixed' ? 'var(--color-resolved-text)' : '#FFFFFF',
              whiteSpace: 'nowrap'
            }}>
              Yes, it's fixed
            </span>
          </div>
        </Parallelogram>

        <Parallelogram
          onClick={() => handleOptionClick('PartiallyFixed')}
          style={{
            background: selectedOpt === 'PartiallyFixed' ? 'var(--color-progress-bg)' : 'rgba(0, 0, 0, 0.2)',
            border: selectedOpt === 'PartiallyFixed' ? '1.5px solid #F59E0B' : '1px solid rgba(255, 255, 255, 0.1)',
            cursor: 'pointer',
            padding: '0.8rem 0.4rem',
            height: '100%',
            borderRadius: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', height: '100%' }}>
            <HelpCircle size={18} style={{ color: selectedOpt === 'PartiallyFixed' ? 'var(--color-progress-text)' : 'var(--color-text-on-card-muted)', flexShrink: 0 }} />
            <span style={{ 
              fontSize: '0.75rem', 
              fontWeight: 600, 
              color: selectedOpt === 'PartiallyFixed' ? 'var(--color-progress-text)' : '#FFFFFF',
              whiteSpace: 'nowrap'
            }}>
              Partially fixed
            </span>
          </div>
        </Parallelogram>

        <Parallelogram
          onClick={() => handleOptionClick('NotFixed')}
          style={{
            background: selectedOpt === 'NotFixed' ? 'var(--color-attention-bg)' : 'rgba(0, 0, 0, 0.2)',
            border: selectedOpt === 'NotFixed' ? '1.5px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.1)',
            cursor: 'pointer',
            padding: '0.8rem 0.4rem',
            height: '100%',
            borderRadius: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', height: '100%' }}>
            <ThumbsDown size={18} style={{ color: selectedOpt === 'NotFixed' ? 'var(--color-attention-text)' : 'var(--color-text-on-card-muted)', flexShrink: 0 }} />
            <span style={{ 
              fontSize: '0.75rem', 
              fontWeight: 600, 
              color: selectedOpt === 'NotFixed' ? 'var(--color-attention-text)' : '#FFFFFF',
              whiteSpace: 'nowrap'
            }}>
              No, still broken
            </span>
          </div>
        </Parallelogram>
      </div>

      {/* Conditionally rendered feedback forms */}
      {selectedOpt === 'VerifiedFixed' && (
        <div style={{ textAlign: 'right' }}>
          <button 
            type="button"
            className="btn-secondary"
            style={{ width: '100%', borderRadius: '12px' }}
            onClick={() => {
              onVerify('VerifiedFixed');
              setSubmitted(true);
            }}
          >
            Confirm Resolution
          </button>
        </div>
      )}

      {(selectedOpt === 'PartiallyFixed' || selectedOpt === 'NotFixed') && (
        <form onSubmit={handleSubmit} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.8rem', color: '#FFFFFF' }}>
              {selectedOpt === 'PartiallyFixed' ? 'Tell us what still needs attention:' : 'Describe why the problem is still there:'}
            </label>
            <textarea
              className="form-input"
              rows={3}
              required
              style={{
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '0.5rem',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                width: '100%',
                resize: 'none',
                color: '#FFFFFF'
              }}
              placeholder="Provide specific details to help the department check the site again."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.8rem', color: '#FFFFFF' }}>
              Upload photographic evidence (Optional):
            </label>
            <EvidenceUploader 
              evidence={photo} 
              onChange={setPhoto} 
              category="Water & Drainage" 
            />
          </div>

          <button 
            type="submit"
            className="btn-secondary"
            style={{ borderRadius: '12px', marginTop: '0.5rem', border: '1px solid var(--color-border)' }}
          >
            {selectedOpt === 'PartiallyFixed' ? 'Submit Partially-Fixed Feedback' : 'Request Official Review'}
          </button>
        </form>
      )}
    </div>
  );
};
