import React, { useState } from 'react';
import { ArrowLeft, MapPin, Building, AlertTriangle, ShieldCheck, Check } from 'lucide-react';
import type { Complaint, Language, CitizenVerificationStatus } from '../types';
import { ComplaintTimeline } from '../components/ComplaintTimeline';
import { ResolutionVerification } from '../components/ResolutionVerification';
import { EvidenceUploader } from '../components/EvidenceUploader';
import { getLocalizedComplaints } from '../mockData';
import { Parallelogram } from '../components/Parallelogram';

interface ComplaintDetailViewProps {
  complaintId: string;
  complaints: Complaint[];
  setComplaints: React.Dispatch<React.SetStateAction<Complaint[]>>;
  onBack: () => void;
  language: Language;
  onAddNotification: (title: string, message: string, complaintId: string) => void;
}

const AFTER_REPAIR_PHOTOS: Record<string, string> = {
  'Roads & Public Spaces': 'https://images.unsplash.com/photo-1594913785162-e6785b4938a2?q=80&w=400&auto=format&fit=crop',
  'Water & Drainage': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=400&auto=format&fit=crop',
  'Waste & Sanitation': 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=400&auto=format&fit=crop',
  'default': 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=400&auto=format&fit=crop'
};

export const ComplaintDetailView: React.FC<ComplaintDetailViewProps> = ({
  complaintId,
  complaints,
  setComplaints,
  onBack,
  language,
  onAddNotification
}) => {
  const [infoText, setInfoText] = useState('');
  const [infoFile, setInfoFile] = useState<string[]>([]);
  const [showInfoForm, setShowInfoForm] = useState(false);
  const [escalated, setEscalated] = useState(false);

  // Localize and fetch complaint details
  const localizedComplaints = getLocalizedComplaints(complaints, language);
  const comp = localizedComplaints.find(c => c.id === complaintId);

  if (!comp) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
        <p>{language === 'hi' ? 'शिकायत नहीं मिली।' : 'Complaint not found.'}</p>
        <button className="btn-primary" onClick={onBack}>{language === 'hi' ? 'वापस जाएं' : 'Go Back'}</button>
      </div>
    );
  }

  const handleResolutionVerify = (
    status: CitizenVerificationStatus,
    comment?: string,
    photo?: string
  ) => {
    setComplaints(prev => prev.map(c => {
      if (c.id === comp.id) {
        let nextStatus = c.status;
        const nextTimeline = [...c.timeline];

        if (status === 'VerifiedFixed') {
          nextStatus = 'Resolved';
          nextTimeline.push({
            title: 'Resolution Verified ✓',
            description: 'Citizen confirmed the issue is fully fixed.',
            date: new Date().toISOString().split('T')[0],
            status: 'completed'
          });
          onAddNotification(
            'Resolution Verified',
            `You verified that complaint ${comp.id} is fixed. Thank you!`,
            comp.id
          );
        } else if (status === 'PartiallyFixed' || status === 'NotFixed') {
          nextStatus = 'Needs Attention';
          nextTimeline.push({
            title: 'Resolution Disputed',
            description: `Citizen reported: ${status === 'PartiallyFixed' ? 'Partially Fixed' : 'Still Broken'}. Notes: ${comment || 'No notes'}`,
            date: new Date().toISOString().split('T')[0],
            status: 'current'
          });
          onAddNotification(
            'Resolution Disputed',
            `You disputed resolution on ${comp.id}. Assigned back for verification.`,
            comp.id
          );
        }

        return {
          ...c,
          status: nextStatus,
          citizenVerification: status,
          citizenFeedback: comment ? { comment, photo } : undefined,
          timeline: nextTimeline.map((t, idx, arr) => {
            if (idx < arr.length - 1) {
              return { ...t, status: 'completed' };
            }
            return t;
          })
        };
      }
      return c;
    }));
  };

  const handleProvideInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!infoText.trim()) return;

    setComplaints(prev => prev.map(c => {
      if (c.id === comp.id) {
        const updatedTimeline = [...c.timeline];
        const currentIdx = updatedTimeline.findIndex(t => t.status === 'current');
        if (currentIdx !== -1) {
          updatedTimeline[currentIdx] = {
            ...updatedTimeline[currentIdx],
            status: 'completed',
            description: 'Requested document submitted by citizen.'
          };
        }

        updatedTimeline.push({
          title: 'Details Received',
          description: 'Verification of uploaded documents in progress.',
          date: new Date().toISOString().split('T')[0],
          status: 'current'
        });

        onAddNotification(
          'Information Received',
          `Additional document loaded for ${comp.id}. Status changed to In Progress.`,
          comp.id
        );

        return {
          ...c,
          status: 'In Progress',
          timeline: updatedTimeline,
          authorityUpdate: 'Document verification in progress. Verification team reviewing bank details.'
        };
      }
      return c;
    }));

    setShowInfoForm(false);
    setInfoText('');
    setInfoFile([]);
  };

  const handleEscalation = () => {
    setEscalated(true);
    setComplaints(prev => prev.map(c => {
      if (c.id === comp.id) {
        const nextTimeline = [...c.timeline];
        const currentIdx = nextTimeline.findIndex(t => t.status === 'current');
        if (currentIdx !== -1) {
          nextTimeline[currentIdx] = { ...nextTimeline[currentIdx], status: 'completed' };
        }

        nextTimeline.push({
          title: 'Grievance Escalated',
          description: 'Escalated to District Commissioner due to SLA delay.',
          date: new Date().toISOString().split('T')[0],
          status: 'current'
        });

        onAddNotification(
          'Grievance Escalated',
          `Complaint ${comp.id} has been escalated to District Commissioner.`,
          comp.id
        );

        return {
          ...c,
          status: 'In Progress',
          timeline: nextTimeline,
          authorityUpdate: 'Escalated to Deputy Commissioner. Reviewing delays in department execution.'
        };
      }
      return c;
    }));
  };

  const beforePhoto = comp.evidence && comp.evidence[0];
  const afterPhoto = AFTER_REPAIR_PHOTOS[comp.category] || AFTER_REPAIR_PHOTOS.default;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '700px', margin: '0 auto' }}>
      
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-primary)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: 0
          }}
        >
          <ArrowLeft size={16} />
          {language === 'hi' ? 'शिकायतों की सूची पर वापस जाएं' : 'Back to List'}
        </button>
      </div>

      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '0.02em' }}>
            ID: {comp.id}
          </span>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginTop: '0.1rem', marginBottom: '0.3rem' }}>
            {comp.subcategory}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {comp.location?.address && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                <MapPin size={14} style={{ color: 'var(--color-primary)' }} />
                {comp.location.address}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              <Building size={14} style={{ color: 'var(--color-primary)' }} />
              {language === 'hi' ? 'जिम्मेदार विभाग:' : 'Responsible:'} {comp.responsibleDepartment}
            </span>
          </div>
        </div>

        <span className={`status-badge ${(comp.status || 'In Progress').toLowerCase().replace(' ', '-')}`}>
          {
            language === 'hi' ? (comp.status === 'Resolved' ? 'हल किया गया' : comp.status === 'Needs Attention' ? 'ध्यान दें' : 'प्रगति में') :
            language === 'as' ? (comp.status === 'Resolved' ? 'সমাধান হৈছে' : comp.status === 'Needs Attention' ? 'মনোযোগৰ প্ৰয়োজন' : 'প্ৰক্ৰিয়াধীন') :
            language === 'bn' ? (comp.status === 'Resolved' ? 'সমাধান করা হয়েছে' : comp.status === 'Needs Attention' ? 'মনোযোগ প্রয়োজন' : 'চলমান') :
            language === 'ta' ? (comp.status === 'Resolved' ? 'தீர்வு காணப்பட்டது' : comp.status === 'Needs Attention' ? 'கவனம் தேவை' : 'செயல்பாட்டில் உள்ளது') :
            (comp.status || 'In Progress')
          }
        </span>
      </div>

      {/* Detailed Status Panels */}
      
      {(comp.status || 'In Progress') === 'Resolved' && (
        <Parallelogram wrapperClassName="card-wrapper" style={{ border: '1.5px solid var(--color-resolved-border)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#A7F3D0', fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.6rem' }}>
            <ShieldCheck size={22} />
            {language === 'hi' ? 'आपकी शिकायत को हल चिह्नित किया गया है' : 'Your complaint has been marked as resolved'}
          </div>
          
          <div style={{ fontSize: '0.82rem', marginBottom: '1.2rem', lineHeight: '1.4' }}>
            <strong>{language === 'hi' ? 'विभाग का बयान:' : 'What the department says:'}</strong>
            <p style={{ fontStyle: 'italic', color: '#FFFFFF', marginTop: '0.2rem', backgroundColor: 'rgba(255, 255, 255, 0.08)', padding: '0.6rem 0.8rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              "{comp.authorityUpdate || (language === 'hi' ? 'मरम्मत का काम पूरा हो गया था।' : 'Repair work was completed.')}"
            </p>
          </div>

          {/* Synthetic Before / After comparison frame */}
          {beforePhoto && (
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-on-card-muted)', display: 'block', fontWeight: 600, marginBottom: '0.4rem' }}>
                {language === 'hi' ? 'दृश्य साक्ष्य तुलना' : 'VISUAL EVIDENCE COMPARISON'}
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-text-on-card-muted)', marginBottom: '0.2rem' }}>
                    {language === 'hi' ? 'पहले (दर्ज की गई)' : 'BEFORE (REPORTED)'}
                  </div>
                  <div style={{ height: '140px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <img src={beforePhoto} alt="Before repair" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#A7F3D0', marginBottom: '0.2rem' }}>
                    {language === 'hi' ? 'बाद में (विभाग कार्रवाई)' : 'AFTER (DEPARTMENT ACTION)'}
                  </div>
                  <div style={{ height: '140px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <img src={afterPhoto} alt="After repair" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Citizen Verification Trigger */}
          <ResolutionVerification 
            currentVerification={comp.citizenVerification} 
            onVerify={handleResolutionVerify} 
          />
        </Parallelogram>
      )}

      {(comp.status || 'In Progress') === 'In Progress' && (
        <Parallelogram wrapperClassName="card-wrapper" style={{ border: '1.5px solid var(--color-progress-border)', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', color: '#FEF3C7', marginBottom: '0.6rem', fontWeight: 700 }}>
            {language === 'hi' ? 'आपकी शिकायत अभी प्रगति में है' : 'Your complaint is still in progress'}
          </h3>
          <div style={{ fontSize: '0.82rem', marginBottom: '0.8rem', lineHeight: '1.4' }}>
            <strong>{language === 'hi' ? 'नवीनतम अपडेट:' : 'Latest update:'}</strong>
            <p style={{ marginTop: '0.2rem', color: '#FFFFFF' }}>
              {comp.authorityUpdate || (language === 'hi' ? 'अधिकारियों को स्थल निरीक्षण हेतु नियुक्त कर दिया गया है।' : 'Assigned to the field engineering team. Waiting for inspection report.')}
            </p>
          </div>
          {comp.expectedResolutionDate && (
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-on-card-muted)' }}>
              <strong>{language === 'hi' ? 'अनुमानित समाधान तिथि:' : 'Expected resolution:'}</strong> {comp.expectedResolutionDate}
            </div>
          )}
        </Parallelogram>
      )}

      {(comp.status || 'In Progress') === 'Needs Attention' && (
        <Parallelogram wrapperClassName="card-wrapper" style={{ border: '1.5px solid var(--color-attention-border)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#FCA5A5', fontWeight: 700, fontSize: '1.05rem' }}>
            <AlertTriangle size={22} />
            {language === 'hi' ? 'आपके ध्यान की आवश्यकता है' : 'Needs your attention'}
          </div>

          {/* Scenario 1: More Info Required */}
          {comp.id === 'GRV-2026-00431' && (
            <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <p style={{ color: '#FFFFFF', margin: 0 }}>
                <strong>{language === 'hi' ? 'कारण:' : 'Reason:'}</strong> {language === 'hi' ? 'हमें आपकी शिकायत पर काम जारी रखने के लिए एक विवरण की आवश्यकता है। विभाग ने पेंशन सत्यापन हेतु पासबुक अपलोड करने का अनुरोध किया है।' : 'We need one more detail to continue processing your complaint. The department has requested bank passbook verification to resolve the pension credit mismatch.'}
              </p>
              
              {!showInfoForm ? (
                <button 
                  onClick={() => setShowInfoForm(true)}
                  className="btn-secondary"
                  style={{ borderRadius: '12px', width: 'fit-content', fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                >
                  {language === 'hi' ? 'जानकारी प्रदान करें' : 'Provide information'}
                </button>
              ) : (
                <form onSubmit={handleProvideInfoSubmit} className="animate-fade-in" style={{ border: '1px solid rgba(255, 255, 255, 0.2)', padding: '1rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.8rem', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem', color: '#FFFFFF' }}>{language === 'hi' ? 'बैंक खाता विवरण दर्ज करें:' : 'Verify Bank Account Number / Pension Card details:'}</label>
                    <div className="form-input-wrapper" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        required
                        placeholder="e.g. Account Number: SBI-304928102"
                        value={infoText}
                        onChange={(e) => setInfoText(e.target.value)}
                        style={{ color: '#FFFFFF' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem', color: '#FFFFFF' }}>{language === 'hi' ? 'पासबुक फोटो अपलोड करें:' : 'Upload Bank Passbook Image:'}</label>
                    <EvidenceUploader evidence={infoFile} onChange={setInfoFile} category="default" />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => setShowInfoForm(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-on-card-muted)', fontSize: '0.8rem', cursor: 'pointer' }}>{language === 'hi' ? 'रद्द करें' : 'Cancel'}</button>
                    <button type="submit" className="btn-secondary" style={{ borderRadius: '12px', fontSize: '0.8rem', padding: '0.4rem 1rem' }}>{language === 'hi' ? 'विवरण जमा करें' : 'Submit Details'}</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Scenario 2: Resolution Disputed */}
          {comp.citizenVerification && comp.citizenVerification !== 'None' && comp.citizenVerification !== 'VerifiedFixed' && (
            <div style={{ fontSize: '0.82rem' }}>
              <p style={{ color: '#FFFFFF', margin: 0 }}>
                <strong>{language === 'hi' ? 'कारण:' : 'Reason:'}</strong> {language === 'hi' ? 'विभाग ने काम पूरा होने की रिपोर्ट की थी, परंतु आपने शिकायत दर्ज की है कि समस्या अभी भी बनी हुई है।' : 'The authority has reported that the issue was resolved, but you indicated that it is still present. Your feedback was sent back for review.'}
              </p>
              <div style={{
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                border: '1px dashed rgba(255, 255, 255, 0.2)',
                padding: '0.6rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                marginTop: '0.5rem',
                color: 'var(--color-text-on-card-muted)'
              }}>
                <strong>{language === 'hi' ? 'आपकी फीडबैक टिप्पणी:' : 'Your feedback note:'}</strong> "{comp.citizenFeedback?.comment || (language === 'hi' ? 'समाधान विवादित।' : 'Resolution disputed.')}"
              </div>
            </div>
          )}

          {/* Scenario 3: Overdue Escalation */}
          {comp.id !== 'GRV-2026-00431' && (!comp.citizenVerification || comp.citizenVerification === 'None') && (
            <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p style={{ color: '#FFFFFF', margin: 0 }}>
                <strong>{language === 'hi' ? 'कारण:' : 'Reason:'}</strong> {language === 'hi' ? 'इस शिकायत की समाधान समय सीमा समाप्त हो गई है।' : 'This complaint has passed its expected resolution date.'}
              </p>
              
              {escalated ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#A7F3D0', fontWeight: 700, fontSize: '0.8rem' }}>
                  <Check size={16} /> {language === 'hi' ? 'उपायुक्त को शिकायत प्रेषित कर दी गई है' : 'Escalation Request Sent to DC'}
                </div>
              ) : (
                <button 
                  onClick={handleEscalation}
                  className="btn-danger"
                  style={{ borderRadius: '12px', width: 'fit-content', fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                >
                  {language === 'hi' ? 'शिकायत आगे बढ़ाएं (एस्केलेट)' : 'Request escalation'}
                </button>
              )}
            </div>
          )}
        </Parallelogram>
      )}

      {/* Description Info block */}
      <Parallelogram wrapperClassName="card-wrapper" style={{ padding: '1.2rem' }}>
        <h4 style={{ fontSize: '0.85rem', color: '#FFFFFF', marginBottom: '0.4rem', fontWeight: 700 }}>
          {language === 'hi' ? 'शिकायत का विवरण' : 'Grievance Description'}
        </h4>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-on-card-muted)', margin: 0, lineHeight: 1.4 }}>
          {comp.description}
        </p>

        {comp.evidence && comp.evidence.length > 0 && (comp.status || 'In Progress') !== 'Resolved' && (
          <div style={{ marginTop: '0.8rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-on-card-muted)', display: 'block', fontWeight: 600, marginBottom: '0.3rem' }}>
              {language === 'hi' ? 'अपलोड किए गए साक्ष्य' : 'ATTACHED CITIZEN EVIDENCE'}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {comp.evidence.map((src, index) => (
                <div key={index} style={{ width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                  <img src={src} alt="Evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </Parallelogram>

      {/* Timeline Section */}
      <Parallelogram wrapperClassName="card-wrapper" style={{ padding: '1.2rem' }}>
        <h4 style={{ fontSize: '0.85rem', color: '#FFFFFF', marginBottom: '0.4rem', fontWeight: 700 }}>
          {language === 'hi' ? 'शिकायत ट्रैकिंग इतिहास' : 'Complaint Tracking History'}
        </h4>
        <ComplaintTimeline events={comp.timeline} />
      </Parallelogram>

    </div>
  );
};
