import React, { useState } from 'react';
import { User, Phone, Mail, MapPin, Globe, Shield, RefreshCw, LogOut, CheckCircle, BellRing } from 'lucide-react';
import type { UserProfile, Language } from '../types';
import { Parallelogram } from '../components/Parallelogram';
import { CustomSelect } from '../components/CustomSelect';
import { STATES_AND_DISTRICTS, getStateForDistrict } from '../statesAndDistricts';

interface ProfileViewProps {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  onLogout: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onRetakeTour: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  setUser,
  onLogout,
  language,
  setLanguage,
  onRetakeTour
}) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email || '');
  const [district, setDistrict] = useState(user.district);
  const [showSuccess, setShowSuccess] = useState(false);

  // Infer user state dynamically from their district
  const userState = user.state || getStateForDistrict(user.district);

  // Mock Notification settings
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedState = getStateForDistrict(district);
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        name,
        email: email || undefined,
        district,
        state: updatedState
      };
    });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };



  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '550px', margin: '0 auto' }}>
      
      {/* Header */}
      <div id="profile-settings-info">
        <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <User size={28} />
          {language === 'hi' ? 'प्रोफ़ाइल सेटिंग्स' : 'Profile Settings'}
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', margin: '0.3rem 0 0 0' }}>
          {language === 'hi' ? 'अपने व्यक्तिगत विवरण, भाषा प्राथमिकताओं और सूचना चैनलों को प्रबंधित करें।' : 'Manage your personal details, language preferences, and notification channels.'}
        </p>
      </div>

      {showSuccess && (
        <div style={{
          backgroundColor: 'var(--color-resolved-bg)',
          border: '1px solid var(--color-resolved-border)',
          borderRadius: '12px',
          padding: '0.8rem 1rem',
          color: 'var(--color-resolved-text)',
          fontSize: '0.8rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle size={18} />
          {language === 'hi' ? 'प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!' : 'Profile updated successfully!'}
        </div>
      )}

      {/* Profile Form Card - inherits solid brown theme */}
      <Parallelogram
        wrapperClassName="card-wrapper"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--bg-card)',
          padding: '1.8rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.25)'
        }}
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          <div>
            <label className="form-label" style={{ color: '#FFFFFF' }}>{language === 'hi' ? 'पूरा नाम' : 'Full Name'}</label>
            <div className="form-input-wrapper" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
              <User size={18} style={{ color: 'var(--color-text-on-card-muted)', marginRight: '0.5rem' }} />
              <input
                type="text"
                className="form-input"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ color: '#FFFFFF' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div>
              <label className="form-label" style={{ color: '#FFFFFF' }}>{language === 'hi' ? 'मोबाइल नंबर' : 'Mobile Number'}</label>
              <div className="form-input-wrapper" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <Phone size={16} style={{ color: 'var(--color-text-on-card-muted)', marginRight: '0.5rem' }} />
                <input
                  type="text"
                  className="form-input"
                  disabled
                  style={{ cursor: 'not-allowed', color: 'var(--color-text-on-card-muted)' }}
                  value={user.mobile}
                />
              </div>
            </div>

            <div>
              <label className="form-label" style={{ color: '#FFFFFF' }}>{language === 'hi' ? 'जिला चयन' : 'District Selection'}</label>
              <CustomSelect
                value={district}
                onChange={setDistrict}
                options={STATES_AND_DISTRICTS[userState].map(d => ({
                  value: d,
                  label: d
                }))}
                icon={<MapPin size={16} style={{ color: 'var(--color-text-on-card-muted)' }} />}
              />
            </div>
          </div>

          <div>
            <label className="form-label" style={{ color: '#FFFFFF' }}>{language === 'hi' ? 'ईमेल पता' : 'Email Address'}</label>
            <div className="form-input-wrapper" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
              <Mail size={18} style={{ color: 'var(--color-text-on-card-muted)', marginRight: '0.5rem' }} />
              <input
                type="email"
                className="form-input"
                placeholder={language === 'hi' ? 'अपना ईमेल पता दर्ज करें' : "Enter your email address"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ color: '#FFFFFF' }}
              />
            </div>
          </div>

          <div>
            <label className="form-label" style={{ color: '#FFFFFF' }}>{language === 'hi' ? 'पसंदीदा पोर्टल भाषा' : 'Preferred Portal Language'}</label>
            <CustomSelect
              value={language}
              onChange={(val) => {
                setLanguage(val as Language);
                setUser(prev => {
                  if (!prev) return null;
                  return { ...prev, preferredLanguage: val as Language };
                });
              }}
              options={[
                { value: 'en', label: 'English' },
                { value: 'hi', label: 'हिन्दी (Hindi)' },
                { value: 'as', label: 'অসমীয়া (Assamese)' },
                { value: 'bn', label: 'বাংলা (Bengali)' },
                { value: 'ta', label: 'தமிழ் (Tamil)' }
              ]}
              icon={<Globe size={16} style={{ color: 'var(--color-text-on-card-muted)' }} />}
            />
          </div>

          {/* Settings Section */}
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1.2rem', marginTop: '0.5rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: '#FFFFFF', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700 }}>
              <BellRing size={16} /> {language === 'hi' ? 'अधिसूचना चैनल' : 'Notification Channels'}
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="sms-notifications"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="sms-notifications" style={{ fontSize: '0.8rem', color: 'var(--color-text-on-card-muted)', cursor: 'pointer' }}>
                  {language === 'hi' ? 'एसएमएस प्रगति अलर्ट प्राप्त करें' : 'Receive SMS progress alerts'}
                </label>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="email-notifications"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="email-notifications" style={{ fontSize: '0.8rem', color: 'var(--color-text-on-card-muted)', cursor: 'pointer' }}>
                  {language === 'hi' ? 'ईमेल सारांश प्राप्त करें' : 'Receive Email summaries'}
                </label>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button 
              type="submit" 
              className="btn-secondary" 
              style={{ flex: 1, borderRadius: '12px', padding: '0.7rem', border: '1.5px solid var(--color-border)' }}
            >
              {language === 'hi' ? 'प्रोफ़ाइल परिवर्तन सहेजें' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </Parallelogram>

      {/* Onboarding Tour Reset */}
      <Parallelogram
        wrapperClassName="card-wrapper"
        style={{
          background: 'var(--bg-card)',
          border: '1.5px dashed rgba(255, 255, 255, 0.3)',
          padding: '1.2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.8rem'
        }}
      >
        <div>
          <strong style={{ fontSize: '0.85rem', display: 'block', color: '#FFFFFF' }}>
            {language === 'hi' ? 'क्या आपको मार्गदर्शन टूर चाहिए?' : 'Need a refresher tour?'}
          </strong>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-on-card-muted)' }}>
            {language === 'hi' ? 'पोर्टल सुविधाओं का पुनः परिचय दौरा शुरू करें।' : 'Re-launch the spotlight walkthrough of portal features.'}
          </span>
        </div>
        <button
          onClick={onRetakeTour}
          className="btn-secondary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '12px' }}
        >
          <RefreshCw size={14} />
          {language === 'hi' ? 'टूर फिर से लें' : 'Take the tour again'}
        </button>
      </Parallelogram>

      {/* Sign Out Action */}
      <button
        onClick={onLogout}
        className="btn-secondary"
        style={{
          borderColor: 'var(--color-attention-border)',
          color: 'var(--color-attention-text)',
          borderRadius: '12px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          fontWeight: 700,
          padding: '0.7rem'
        }}
      >
        <LogOut size={16} />
        {language === 'hi' ? 'समाधान से साइन आउट करें' : 'Sign Out from SAMADHAN'}
      </button>

      {/* Disclaimer details */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        gap: '0.3rem', 
        color: 'var(--color-text-muted)', 
        fontSize: '0.75rem', 
        lineHeight: 1.3,
        padding: '0 0.5rem'
      }}>
        <Shield size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>
          {language === 'hi' 
            ? 'समाधान क्रेडेंशियल्स को स्टोर करने के लिए इस ब्राउज़र सत्र के अंदर स्थानीय संग्रहण का उपयोग करता है।' 
            : 'SAMADHAN utilizes localized storage inside this browser session to store credentials. Clearing cookies/local storage will clear mock complaints.'
          }
        </span>
      </div>
    </div>
  );
};
