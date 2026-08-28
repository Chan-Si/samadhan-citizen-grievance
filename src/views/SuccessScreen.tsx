import React from 'react';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';
import type { Language } from '../types';
import { Parallelogram } from '../components/Parallelogram';

interface SuccessScreenProps {
  grievanceId: string;
  department: string;
  onTrack: () => void;
  onGoHome: () => void;
  language: Language;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({
  grievanceId,
  department,
  onTrack,
  onGoHome,
  language
}) => {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '500px', margin: '2rem auto', textAlign: 'center' }}>
      
      {/* Circle Icon */}
      <div style={{
        width: '72px',
        height: '72px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-resolved-bg)',
        color: 'var(--color-resolved-text)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto',
        border: '3px solid var(--color-resolved-border)',
        boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.2)'
      }}>
        <CheckCircle size={36} />
      </div>

      <div>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>
          {language === 'hi' ? 'शिकायत सफलतापूर्वक दर्ज की गई' : 'Complaint submitted successfully'}
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.3rem', margin: 0 }}>
          {language === 'hi' ? 'आपकी शिकायत हमारे सिस्टम में दर्ज कर ली गई है।' : 'Your complaint has been successfully recorded in our system.'}
        </p>
      </div>

      {/* Grievance card details - inherits solid brown theme */}
      <Parallelogram
        wrapperClassName="card-wrapper"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--bg-card)',
          padding: '1.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.25)'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-on-card-muted)', display: 'block', fontWeight: 600 }}>
              {language === 'hi' ? 'शिकायत संदर्भ आईडी' : 'COMPLAINT REFERENCE ID'}
            </span>
            <strong style={{ fontSize: '1.4rem', color: '#FFFFFF', letterSpacing: '0.05em' }}>
              {grievanceId}
            </strong>
          </div>

          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '0.8rem' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-on-card-muted)', display: 'block', fontWeight: 600 }}>
              {language === 'hi' ? 'स्वचालित रूप से प्रेषित विभाग' : 'AUTOMATICALLY ROUTED TO'}
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF', display: 'block', marginTop: '0.2rem' }}>
              {department}
            </span>
          </div>
        </div>
      </Parallelogram>

      {/* What happens next section - styled as a brown card */}
      <Parallelogram wrapperClassName="card-wrapper" style={{ textAlign: 'left', padding: '1.2rem' }}>
        <h4 style={{ fontSize: '0.88rem', color: '#FFFFFF', marginBottom: '0.6rem', fontWeight: 700 }}>
          {language === 'hi' ? 'आगे क्या होगा?' : 'What happens next?'}
        </h4>
        <ol style={{ fontSize: '0.78rem', color: 'var(--color-text-on-card-muted)', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', lineHeight: '1.4' }}>
          <li>
            <strong>{language === 'hi' ? 'अभिलेख सत्यापन:' : 'Record Verification:'}</strong> {language === 'hi' ? `आपकी शिकायत आईडी ${grievanceId} आपके स्थानीय ब्राउज़र प्रोफ़ाइल में दर्ज है।` : `Your complaint reference ID ${grievanceId} is logged in your local browser profile.`}
          </li>
          <li>
            <strong>{language === 'hi' ? 'विभाग आवंटन:' : 'Department Assignment:'}</strong> {language === 'hi' ? `यह मूल्यांकन के लिए ${department} को सौंप दी गई है।` : `It is assigned to the ${department} for engineering evaluation.`}
          </li>
          <li>
            <strong>{language === 'hi' ? 'वास्तविक समय ट्रैकिंग:' : 'Real-time Tracking:'}</strong> {language === 'hi' ? 'आपको स्थिति अपडेट पर सूचनाएं प्राप्त होंगी। प्रगति को मेरी शिकायतें से ट्रैक करें।' : 'You will receive notifications on status updates. Track progress via My Complaints.'}
          </li>
          <li>
            <strong>{language === 'hi' ? 'नागरिक सत्यापन द्वार:' : 'Citizen Verification Gate:'}</strong> {language === 'hi' ? 'एक बार जब विभाग काम पूरा होने की रिपोर्ट करेगा, तो आपको काम की समीक्षा करनी होगी और पुष्टि करनी होगी कि क्या यह वास्तव में ठीक हो गया है।' : 'Once the authority reports resolution, you must review their work and confirm if the issue is actually resolved.'}
          </li>
        </ol>
      </Parallelogram>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
        <button
          onClick={onGoHome}
          className="btn-secondary"
          style={{ flex: 1, borderRadius: '12px', padding: '0.7rem' }}
        >
          <Home size={16} />
          {language === 'hi' ? 'मुख्य पृष्ठ पर जाएं' : 'Back to Home'}
        </button>
        <button
          onClick={onTrack}
          className="btn-secondary"
          style={{ flex: 1.5, borderRadius: '12px', padding: '0.7rem', border: '1.5px solid var(--color-border)' }}
        >
          {language === 'hi' ? 'मेरी शिकायत ट्रैक करें' : 'Track my complaint'}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
