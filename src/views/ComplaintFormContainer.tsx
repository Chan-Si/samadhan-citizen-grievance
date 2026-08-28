import React, { useState } from 'react';
import { ArrowLeft, Calendar, AlertCircle, Info, ShieldAlert, Mic, MicOff } from 'lucide-react';
import type { Complaint, Language, LocationData } from '../types';
import { getLocalizedCategories } from '../mockData';
import { Parallelogram } from '../components/Parallelogram';
import { LocationSelector } from '../components/LocationSelector';
import { EvidenceUploader } from '../components/EvidenceUploader';
import { CustomSelect } from '../components/CustomSelect';

interface ComplaintFormProps {
  categoryId: string;
  subtopicId: string;
  user: any;
  onSubmit: (data: Partial<Complaint>) => void;
  onBack: () => void;
  language: Language;
}

export const ComplaintFormContainer: React.FC<ComplaintFormProps> = ({
  categoryId,
  subtopicId,
  user,
  onSubmit,
  onBack,
  language
}) => {
  // Fetch dynamic translated categories config
  const localizedCategories = getLocalizedCategories(language);
  const category = localizedCategories.find(c => c.id === categoryId);
  const subtopic = category?.subtopics.find(s => s.id === subtopicId);

  // Form Fields State
  const [description, setDescription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [location, setLocation] = useState<LocationData>({
    type: 'current',
    address: '',
    district: user.district
  });
  const [dateObserved, setDateObserved] = useState(new Date().toISOString().split('T')[0]);
  const [severity, setSeverity] = useState<'Minor' | 'Moderate' | 'Serious / Safety risk'>('Moderate');
  const [evidence, setEvidence] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  // New Sections State
  const [hasPriorGrievance, setHasPriorGrievance] = useState<'no' | 'yes'>('no');
  const [priorGrievanceId, setPriorGrievanceId] = useState('');
  const [priorGrievanceDate, setPriorGrievanceDate] = useState('');
  const [affectedPeopleCount, setAffectedPeopleCount] = useState<'individual' | 'neighborhood' | 'community'>('individual');

  const handleVoiceInput = () => {
    setIsRecording(true);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      rec.continuous = false;
      rec.interimResults = false;
      
      rec.onresult = (e: any) => {
        if (e.results && e.results[0] && e.results[0][0]) {
          setDescription(prev => (prev ? prev + ' ' : '') + e.results[0][0].transcript);
        }
      };
      rec.onerror = (err: any) => {
        console.error("Speech recognition error:", err);
        const simulatedText = language === 'hi'
          ? "यह प्राथमिक विद्यालय के पास सड़क पर एक बहुत बड़ा गड्ढा है जो खतरनाक है।"
          : "This is a serious pothole near the primary school causing safety issues.";
        setDescription(prev => (prev ? prev + ' ' : '') + simulatedText);
      };
      rec.onend = () => {
        setIsRecording(false);
      };
      rec.start();
    } else {
      const simulatedText = language === 'hi'
        ? "यह प्राथमिक विद्यालय के पास सड़क पर एक बहुत बड़ा गड्ढा है जो खतरनाक है।"
        : "This is a serious pothole near the primary school causing safety issues.";
      setDescription(prev => (prev ? prev + ' ' : '') + simulatedText);
      setIsRecording(false);
    }
  };

  // Category-specific fields
  const [consumerNumber, setConsumerNumber] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [misconductType, setMisconductType] = useState('');
  const [officeInvolved, setOfficeInvolved] = useState('');

  if (!category || !subtopic) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
        <p>{language === 'hi' ? 'समस्या विन्यास नहीं मिला।' : 'Problem configuration not found.'}</p>
        <button className="btn-primary" onClick={onBack}>{language === 'hi' ? 'वापस जाएं' : 'Go Back'}</button>
      </div>
    );
  }

  // Determine what details to show based on category
  const needsLocation = ['roads', 'electricity', 'water', 'waste', 'transport', 'education', 'healthcare', 'misconduct'].includes(categoryId);
  const needsEvidence = ['roads', 'water', 'waste', 'transport', 'education', 'healthcare', 'misconduct'].includes(categoryId);
  const needsDateObserved = ['roads', 'electricity', 'water', 'waste', 'transport'].includes(categoryId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!description.trim()) {
      setErrorMsg(language === 'hi' ? 'कृपया समस्या का वर्णन करें।' : 'Please describe the problem.');
      return;
    }

    if (needsLocation && !location.address.trim()) {
      setErrorMsg(language === 'hi' ? 'कृपया समस्या का स्थान निर्दिष्ट करें।' : 'Please specify the location of the problem.');
      return;
    }

    // Prepare complaint payload
    const formPayload: Partial<Complaint> = {
      category: category.title,
      subcategory: subtopic.title,
      description,
      location: needsLocation ? location : { type: 'manual', address: `${language === 'hi' ? 'जिला प्रशासन' : 'District Administration'}, ${user.district}`, district: user.district },
      dateObserved,
      severity,
      evidence,
      affectedCitizenCount: affectedPeopleCount === 'individual' ? 1 : affectedPeopleCount === 'neighborhood' ? 12 : 65,
      responsibleDepartment: category.routingDepartment,
      citizenVerification: 'None',
      
      // Category Specifics
      consumerNumber: consumerNumber || undefined,
      serviceType: serviceType || undefined,
      documentType: documentType || undefined,
      referenceNumber: referenceNumber || undefined,
      institutionName: institutionName || undefined,
      misconductType: misconductType || undefined,
      officeInvolved: officeInvolved || undefined,

      // Prior Grievance History
      priorGrievanceId: hasPriorGrievance === 'yes' ? priorGrievanceId : undefined,
      priorGrievanceDate: hasPriorGrievance === 'yes' ? priorGrievanceDate : undefined
    };

    onSubmit(formPayload);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '650px', margin: '0 auto' }}>
      
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
          {language === 'hi' ? 'समस्या प्रकार बदलें' : 'Change Subtopic'}
        </button>
      </div>

      {/* Header Info - Middle Aligned */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
        <h1 style={{ fontSize: '2.4rem', color: 'var(--color-primary)', margin: 0, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
          {category.title}
        </h1>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.2rem' }}>
          {subtopic.title}
        </h3>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--color-text-main)', marginTop: '0.4rem', marginBottom: '0.2rem', fontWeight: 700 }}>
          {language === 'hi' ? 'विवरण प्रदान करें' : 'Provide Details'}
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', lineHeight: '1.4', margin: 0, maxWidth: '580px' }}>
          {language === 'hi' 
            ? 'हमें बताएं कि समस्या कहाँ है और क्या हो रहा है। हम इस जानकारी का उपयोग उचित विभाग को शिकायत प्रेषित करने के लिए करेंगे।' 
            : "Tell us where the problem is and what you are experiencing. We'll use this information to route your complaint to the appropriate authority."
          }
        </p>
      </div>

      {errorMsg && (
        <div style={{
          backgroundColor: 'var(--color-attention-bg)',
          border: '1px solid var(--color-attention-border)',
          borderRadius: '12px',
          padding: '0.8rem 1rem',
          color: 'var(--color-attention-text)',
          fontSize: '0.8rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle size={18} />
          {errorMsg}
        </div>
      )}

      {/* Form Container Card - Solid brown card matching other views */}
      <Parallelogram
        wrapperClassName="card-wrapper"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--bg-card)',
          padding: '2rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.25)'
        }}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Healthcare and Misconduct helpers */}
          {categoryId === 'healthcare' && (
            <div style={{ display: 'flex', gap: '0.4rem', backgroundColor: 'rgba(255, 255, 255, 0.08)', padding: '0.6rem 0.8rem', borderRadius: '12px', fontSize: '0.75rem', color: 'var(--color-text-on-card-muted)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Info size={16} style={{ color: '#FFFFFF', flexShrink: 0 }} />
              <span>{language === 'hi' ? 'कृपया सार्वजनिक स्वास्थ्य सुविधा की समस्या को समझाने के लिए केवल आवश्यक विवरण प्रदान करें। चिकित्सा इतिहास साझा न करें।' : 'Please provide only the information necessary to explain the public healthcare facility issue. Do not include personal medical records.'}</span>
            </div>
          )}

          {categoryId === 'misconduct' && (
            <div style={{ display: 'flex', gap: '0.4rem', backgroundColor: 'rgba(255, 255, 255, 0.08)', padding: '0.6rem 0.8rem', borderRadius: '12px', fontSize: '0.75rem', color: 'var(--color-text-on-card-muted)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <ShieldAlert size={16} style={{ color: '#FFFFFF', flexShrink: 0 }} />
              <span>{language === 'hi' ? 'आधिकारिक कदाचार या भ्रष्टाचार की घटनाओं का विवरण व्यावसायिक रूप से नोट करें।' : 'Share only the details necessary to explain what occurred. Demands for bribes, unethical practices, or harassment should be noted professionally.'}</span>
            </div>
          )}

          {/* DYNAMIC FORM SECTION */}
          
          {/* Electricity Meter / Service */}
          {categoryId === 'electricity' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div>
                <label className="form-label" style={{ color: '#FFFFFF' }}>{language === 'hi' ? 'उपभोक्ता नंबर (वैकल्पिक)' : 'Consumer Number (Optional)'}</label>
                <div className="form-input-wrapper" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 102003928"
                    value={consumerNumber}
                    onChange={(e) => setConsumerNumber(e.target.value)}
                    style={{ color: '#FFFFFF' }}
                  />
                </div>
              </div>
              <div>
                <label className="form-label" style={{ color: '#FFFFFF' }}>{language === 'hi' ? 'कनेक्शन का प्रकार' : 'Connection Type'}</label>
                <div className="form-input-wrapper" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Domestic/Commercial"
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    style={{ color: '#FFFFFF' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Government Services / Application info */}
          {categoryId === 'gov_services' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div>
                <label className="form-label" style={{ color: '#FFFFFF' }}>{language === 'hi' ? 'सेवा / प्रमाणपत्र का नाम' : 'Service/Document Name'}</label>
                <div className="form-input-wrapper" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Driving Licence"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    style={{ color: '#FFFFFF' }}
                  />
                </div>
              </div>
              <div>
                <label className="form-label" style={{ color: '#FFFFFF' }}>{language === 'hi' ? 'रसीद / आवेदन संख्या' : 'Application Reference Number'}</label>
                <div className="form-input-wrapper" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. APP-9938210"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    style={{ color: '#FFFFFF' }}
                  />
                </div>
                <span style={{ display: 'block', fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.7)', marginTop: '0.35rem', marginBottom: 0 }}>
                  {language === 'hi' 
                    ? 'यह संख्या आपके आवेदन पत्र की पावती रसीद या सेवा पोर्टल से मिले पुष्टिकरण SMS/ईमेल पर मिलेगी।' 
                    : 'Found on the acknowledgment receipt slip or confirmation SMS/email sent from the service portal.'}
                </span>
              </div>
            </div>
          )}

          {/* Pension and benefits specifics */}
          {categoryId === 'pension' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div>
                <label className="form-label" style={{ color: '#FFFFFF' }}>{language === 'hi' ? 'योजना / पेंशन का नाम' : 'Pension/Scheme Type'}</label>
                <div className="form-input-wrapper" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Old Age Pension"
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    style={{ color: '#FFFFFF' }}
                  />
                </div>
              </div>
              <div>
                <label className="form-label" style={{ color: '#FFFFFF' }}>{language === 'hi' ? 'लाभार्थी संख्या / पेंशन आईडी' : 'Beneficiary Reference ID'}</label>
                <div className="form-input-wrapper" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. PEN-10293"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    style={{ color: '#FFFFFF' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Certificates and documents specifics */}
          {categoryId === 'certificates' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div>
                <label className="form-label" style={{ color: '#FFFFFF' }}>{language === 'hi' ? 'दस्तावेज़ का प्रकार' : 'Document/Certificate Type'}</label>
                <div className="form-input-wrapper" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Birth Certificate"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    style={{ color: '#FFFFFF' }}
                  />
                </div>
              </div>
              <div>
                <label className="form-label" style={{ color: '#FFFFFF' }}>{language === 'hi' ? 'पावती / आवेदन संख्या' : 'Acknowledgement Number'}</label>
                <div className="form-input-wrapper" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. ACK-203928"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    style={{ color: '#FFFFFF' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Education specifics */}
          {categoryId === 'education' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div>
                <label className="form-label" style={{ color: '#FFFFFF' }}>{language === 'hi' ? 'स्कूल / संस्थान का नाम' : 'School/Institution Name'}</label>
                <div className="form-input-wrapper" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Model High School"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    style={{ color: '#FFFFFF' }}
                  />
                </div>
              </div>
              <div>
                <label className="form-label" style={{ color: '#FFFFFF' }}>{language === 'hi' ? 'बोर्ड / विश्वविद्यालय (यदि लागू हो)' : 'Education Board/Class'}</label>
                <div className="form-input-wrapper" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Class X / Board SEBA"
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    style={{ color: '#FFFFFF' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Public Official and Misconduct fields */}
          {categoryId === 'misconduct' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div>
                <label className="form-label" style={{ color: '#FFFFFF' }}>{language === 'hi' ? 'संबंधित कार्यालय' : 'Office/Department Involved'}</label>
                <div className="form-input-wrapper" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Sub-Registrar Office"
                    value={officeInvolved}
                    onChange={(e) => setOfficeInvolved(e.target.value)}
                    style={{ color: '#FFFFFF' }}
                  />
                </div>
              </div>
              <div>
                <label className="form-label" style={{ color: '#FFFFFF' }}>{language === 'hi' ? 'कदाचार का प्रकार' : 'Type of Misconduct'}</label>
                <div className="form-input-wrapper" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Demanding Bribe"
                    value={misconductType}
                    onChange={(e) => setMisconductType(e.target.value)}
                    style={{ color: '#FFFFFF' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Core Description Textbox */}
          <div>
            <label className="form-label" style={{ color: '#FFFFFF' }}>{language === 'hi' ? 'समस्या का विस्तृत वर्णन *' : 'Describe the problem in detail *'}</label>
            <div className="form-input-wrapper" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', borderColor: 'rgba(255, 255, 255, 0.2)', position: 'relative' }}>
              <textarea
                className="form-input"
                rows={4}
                required
                placeholder={isRecording
                  ? (language === 'hi' ? 'सुन रहा हूँ... कृपया बोलें...' : 'Listening... Please speak...')
                  : (language === 'hi' ? 'कृपया यहाँ अपनी समस्या का विस्तृत विवरण लिखें...' : "Explain what is happening. Include details like duration, streets, or exact dates...")
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ resize: 'none', color: '#FFFFFF', paddingRight: '45px' }}
              />
              
              {/* Floating mic icon inside text area */}
              <button
                type="button"
                onClick={handleVoiceInput}
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  backgroundColor: isRecording ? '#EF4444' : 'rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  border: 'none',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: isRecording ? '0 0 0 0 rgba(239, 68, 68, 0.7)' : 'none',
                  animation: isRecording ? 'pulse-red 1.5s infinite' : 'none'
                }}
                title={language === 'hi' ? 'बोलकर दर्ज करें' : 'Speak instead'}
              >
                {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            </div>
            {isRecording && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#EF4444', fontSize: '0.78rem', fontWeight: 600, marginTop: '0.4rem', justifyContent: 'center' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                <span>{language === 'hi' ? 'सुन रहा हूँ... बोलना शुरू करें' : 'Listening... speak now'}</span>
              </div>
            )}
          </div>

          {/* Map Geolocation Selector */}
          {needsLocation && (
            <div>
              <label className="form-label" style={{ color: '#FFFFFF' }}>{language === 'hi' ? 'नक्शे पर सटीक स्थान निर्दिष्ट करें *' : 'Select Location on Map *'}</label>
              <LocationSelector 
                district={user.district}
                onLocationSelect={(loc) => setLocation(loc)}
                language={language}
              />
            </div>
          )}

          {/* Date Observed & Severity Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: needsDateObserved ? '1fr 1fr' : '1fr', gap: '0.8rem' }}>
            {needsDateObserved && (
              <div>
                <label className="form-label" style={{ color: '#FFFFFF' }}>{language === 'hi' ? 'कब पहली बार देखा?' : 'When did you first notice?'}</label>
                <div className="form-input-wrapper" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                  <Calendar size={18} style={{ color: 'var(--color-text-on-card-muted)', marginRight: '0.5rem' }} />
                  <input
                    type="date"
                    className="form-input"
                    value={dateObserved}
                    onChange={(e) => setDateObserved(e.target.value)}
                    style={{ color: '#FFFFFF' }}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="form-label" style={{ color: '#FFFFFF' }}>{language === 'hi' ? 'गंभीरता का स्तर *' : 'Severity Level *'}</label>
              <CustomSelect
                value={severity}
                onChange={(val) => setSeverity(val as any)}
                options={[
                  { value: 'Minor', label: language === 'hi' ? 'मामूली (कम प्रभाव)' : 'Minor (Low impact)' },
                  { value: 'Moderate', label: language === 'hi' ? 'मध्यम (सामान्य असुविधा)' : 'Moderate (Standard problem)' },
                  { value: 'Serious / Safety risk', label: language === 'hi' ? 'गंभीर (सुरक्षा जोखिम)' : 'Serious / Safety risk' }
                ]}
              />
            </div>
          </div>

          {/* Section: Impact & Scope */}
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1.2rem' }}>
            <h4 style={{ color: '#FFFFFF', margin: '0 0 0.8rem 0', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {language === 'hi' ? 'प्रभाव और दायरा' : 'Impact & Scope'}
            </h4>
            
            <div>
              <label className="form-label" style={{ color: '#FFFFFF' }}>
                {language === 'hi' ? 'इस समस्या से कौन प्रभावित है? *' : 'Who is affected by this issue? *'}
              </label>
              <CustomSelect
                value={affectedPeopleCount}
                onChange={(val) => setAffectedPeopleCount(val as any)}
                options={[
                  { value: 'individual', label: language === 'hi' ? 'केवल मैं / मेरा परिवार (1 व्यक्ति/परिवार)' : 'Just Me / My Household (1 person)' },
                  { value: 'neighborhood', label: language === 'hi' ? 'मेरा तत्काल पड़ोस (5-10+ लोग)' : 'My Immediate Neighbors (5-10+ people)' },
                  { value: 'community', label: language === 'hi' ? 'संपूर्ण इलाका / वार्ड (50+ लोग)' : 'Entire Locality / Ward (50+ people)' }
                ]}
              />
            </div>
          </div>

          {/* Section: Prior Grievance History */}
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1.2rem', paddingBottom: '0.5rem' }}>
            <h4 style={{ color: '#FFFFFF', margin: '0 0 0.8rem 0', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {language === 'hi' ? 'पूर्व शिकायत इतिहास' : 'Prior Grievance History'}
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div>
                <label className="form-label" style={{ color: '#FFFFFF' }}>
                  {language === 'hi' ? 'क्या आपने पहले इस समस्या के लिए कोई शिकायत दर्ज की है? *' : 'Have you filed a complaint for this issue before? *'}
                </label>
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.2rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#FFFFFF', fontSize: '0.82rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="prior-grievance" 
                      value="no" 
                      checked={hasPriorGrievance === 'no'}
                      onChange={() => setHasPriorGrievance('no')}
                      style={{ cursor: 'pointer' }}
                    />
                    {language === 'hi' ? 'नहीं' : 'No'}
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#FFFFFF', fontSize: '0.82rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="prior-grievance" 
                      value="yes" 
                      checked={hasPriorGrievance === 'yes'}
                      onChange={() => setHasPriorGrievance('yes')}
                      style={{ cursor: 'pointer' }}
                    />
                    {language === 'hi' ? 'हाँ' : 'Yes'}
                  </label>
                </div>
              </div>

              {hasPriorGrievance === 'yes' && (
                <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginTop: '0.4rem' }}>
                  <div>
                    <label className="form-label" style={{ color: '#FFFFFF' }}>
                      {language === 'hi' ? 'पूर्व शिकायत संख्या' : 'Prior Grievance Number'}
                    </label>
                    <div className="form-input-wrapper" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. CPG-839210"
                        value={priorGrievanceId}
                        onChange={(e) => setPriorGrievanceId(e.target.value)}
                        style={{ color: '#FFFFFF' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="form-label" style={{ color: '#FFFFFF' }}>
                      {language === 'hi' ? 'फाइल करने की तिथि' : 'Prior Filing Date'}
                    </label>
                    <div className="form-input-wrapper" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                      <Calendar size={18} style={{ color: 'var(--color-text-on-card-muted)', marginRight: '0.5rem' }} />
                      <input
                        type="date"
                        className="form-input"
                        value={priorGrievanceDate}
                        onChange={(e) => setPriorGrievanceDate(e.target.value)}
                        style={{ color: '#FFFFFF' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Photo / Video evidence Uploader */}
          {needsEvidence && (
            <div>
              <label className="form-label" style={{ color: '#FFFFFF' }}>{language === 'hi' ? 'साक्ष्य अपलोड करें (वैकल्पिक फोटो/वीडियो)' : 'Attach Visual Evidence (Photos/Videos)'}</label>
              <EvidenceUploader
                evidence={evidence}
                onChange={setEvidence}
                category={category.title}
              />
            </div>
          )}

          {/* Form Action Submit */}
          <button 
            type="submit" 
            className="btn-secondary" 
            style={{ width: '100%', borderRadius: '12px', marginTop: '0.5rem' }}
          >
            {language === 'hi' ? 'शिकायत की समीक्षा करें' : 'Review Grievance'}
          </button>

        </form>
      </Parallelogram>
    </div>
  );
};
