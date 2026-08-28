import React, { useState, useEffect } from 'react';
import { HelpCircle, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { Parallelogram } from './Parallelogram';

interface OnboardingTourProps {
  onComplete: () => void;
}

interface TourStep {
  targetId: string;
  title: string;
  description: string;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: TourStep[] = [
    {
      targetId: 'homepage-categories-section',
      title: 'Step 1: Choose a Problem Category',
      description: "Choose the type of problem you want to report. You don't need to know which department handles it."
    },
    {
      targetId: 'top-complaints-section',
      title: 'Step 2: Top Complaints in Guwahati',
      description: "See important problems reported by people in your district and quickly join an existing complaint."
    },
    {
      targetId: 'nav-my-complaints',
      title: 'Step 3: Track via My Complaints',
      description: "Track everything you've reported from one place."
    },
    {
      targetId: 'complaint-status-filters-info', // We will explain status filters here
      title: 'Step 4: Real-time Statuses',
      description: "See whether your complaint is in progress, resolved, or needs your attention. Remember: it's only fully resolved when you confirm!"
    },
    {
      targetId: 'nav-notification-bell',
      title: 'Step 5: Notification Updates',
      description: "Get important alerts and updates about your complaints here."
    },
    {
      targetId: 'profile-settings-info', // We can target the profile nav/page
      title: 'Step 6: User Profile & Language',
      description: "Change your language and manage your district preferences from your profile."
    },
    {
      targetId: 'floating-help-assistant',
      title: 'Step 7: Samadhan Assistant',
      description: "Not sure what to report? Describe it in your own words or speak to our voice assistant."
    }
  ];

  const currentStepData = steps[currentStep];

  useEffect(() => {
    // Scroll target element into view and add highlight class
    const target = document.getElementById(currentStepData.targetId);
    
    // Remove previous highlights
    steps.forEach(step => {
      const el = document.getElementById(step.targetId);
      if (el) {
        el.classList.remove('tour-highlight');
      }
    });

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('tour-highlight');
    }
  }, [currentStep, currentStepData.targetId]);

  // Clean up highlights on unmount
  useEffect(() => {
    return () => {
      steps.forEach(step => {
        const el = document.getElementById(step.targetId);
        if (el) {
          el.classList.remove('tour-highlight');
        }
      });
    };
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    steps.forEach(step => {
      const el = document.getElementById(step.targetId);
      if (el) {
        el.classList.remove('tour-highlight');
      }
    });
    onComplete();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.25)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      padding: '1.5rem',
      pointerEvents: 'none' /* Let users click items? No, overlay blocks clicks to focus on tour */
    }}>
      <div 
        style={{ pointerEvents: 'auto', width: '100%', maxWidth: '480px' }}
        className="animate-fade-in"
      >
        <Parallelogram
          wrapperClassName="card-wrapper"
          style={{
            background: '#FFFFFF',
            border: '2px solid var(--color-primary)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
            padding: '1.5rem',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <span style={{ 
              fontWeight: 700, 
              color: 'var(--color-primary)', 
              fontSize: '0.8rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              Tour • {currentStep + 1} of {steps.length}
            </span>
            <button 
              onClick={handleComplete} 
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '2px'
              }}
              aria-label="Skip Tour"
            >
              <X size={18} />
            </button>
          </div>

          {/* Title & Body */}
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <HelpCircle size={20} style={{ color: 'var(--color-primary)' }} />
            {currentStepData.title}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
            {currentStepData.description}
          </p>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button 
              onClick={handleComplete}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-muted)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontWeight: 500,
                textDecoration: 'underline'
              }}
            >
              Skip tour
            </button>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                disabled={currentStep === 0}
                onClick={handleBack}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  color: currentStep === 0 ? 'var(--color-text-muted)' : 'var(--color-text-main)',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  borderRadius: '6px'
                }}
              >
                <ChevronLeft size={16} />
                Back
              </button>

              <button
                onClick={handleNext}
                style={{
                  background: 'var(--color-primary)',
                  border: 'none',
                  color: '#FFFFFF',
                  padding: '0.5rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  borderRadius: '6px'
                }}
              >
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </Parallelogram>
      </div>

      <style>{`
        .tour-highlight {
          position: relative !important;
          z-index: 999 !important;
          outline: 3px solid #D97706 !important; /* Pulse amber outline */
          outline-offset: 4px;
          animation: pulseHighlight 1.5s infinite;
          box-shadow: 0 0 15px rgba(217, 119, 6, 0.4) !important;
          border-radius: 8px;
        }
        @keyframes pulseHighlight {
          0% { outline-color: rgba(217, 119, 6, 1); }
          50% { outline-color: rgba(217, 119, 6, 0.3); }
          100% { outline-color: rgba(217, 119, 6, 1); }
        }
      `}</style>
    </div>
  );
};
