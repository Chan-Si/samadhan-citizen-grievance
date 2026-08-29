import React, { useState, useEffect } from 'react';
import { MapPin, Users, HelpCircle, ArrowRight, Check } from 'lucide-react';
import type { Complaint, Language, LocationData } from '../types';
import { 
  getLocalizedCategories, 
  getLocalizedComplaints, 
  getLocalizedFirstName, 
  TRANSLATIONS 
} from '../mockData';
import { Parallelogram } from '../components/Parallelogram';
import { LocationSelector } from '../components/LocationSelector';
import { complaintService } from '../services';

const HINDI_DISTRICTS: Record<string, string> = {
  'Guwahati': 'गुवाहाटी',
  'Kamrup Metropolitan': 'कामरूप मेट्रोपॉलिटन',
  'Dibrugarh': 'डिब्रूगढ़',
  'Jorhat': 'जोरहाट',
  'Cachar': 'कछार',
  'Sonitpur': 'शोणितपुर',
  'Bongaigaon': 'बोंगाईगांव'
};

const getDynamicGreeting = (lang: Language): string => {
  const hour = new Date().getHours();
  if (lang === 'hi') {
    if (hour >= 4 && hour < 12) return 'सुप्रभात';
    if (hour >= 12 && hour < 17) return 'शुभ दोपहर';
    if (hour >= 17 && hour < 22) return 'शुभ संध्या';
    return 'शुभ रात्रि';
  }
  if (lang === 'as') {
    if (hour >= 4 && hour < 12) return 'সুপ্রভাত';
    if (hour >= 12 && hour < 17) return 'শুভ অপৰাহ্ন';
    if (hour >= 17 && hour < 22) return 'শুভ সন্ধিয়া';
    return 'শুভ রাত্রি';
  }
  if (lang === 'bn') {
    if (hour >= 4 && hour < 12) return 'সুপ্রভাত';
    if (hour >= 12 && hour < 17) return 'শুভ দুপুর';
    if (hour >= 17 && hour < 22) return 'শুভ সন্ধ্যা';
    return 'শুভ রাত্রি';
  }
  if (lang === 'ta') {
    if (hour >= 4 && hour < 12) return 'காலை வணக்கம்';
    if (hour >= 12 && hour < 17) return 'மதிய வணக்கம்';
    if (hour >= 17 && hour < 22) return 'மாலை வணக்கம்';
    return 'இரவு வணக்கம்';
  }
  if (hour >= 4 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 22) return 'Good evening';
  return 'Good night';
};

// Reusable pastel vector icons to create that professional AI-style feel
export const CategoryIcon: React.FC<{ name: string; color?: string }> = ({ name, color = '#FFFFFF' }) => {
  return (
    <div style={{
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      background: 'rgba(255, 255, 255, 0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: color,
      flexShrink: 0
    }}>
      <span style={{ fontSize: '1.5rem' }}>
        {name === 'RoadIcon' && '🛣️'}
        {name === 'ZapIcon' && '⚡'}
        {name === 'DropletIcon' && '💧'}
        {name === 'TrashIcon' && '🗑️'}
        {name === 'BusIcon' && '🚌'}
        {name === 'FileTextIcon' && '📄'}
        {name === 'CreditCardIcon' && '💳'}
        {name === 'AwardIcon' && '📜'}
        {name === 'BookOpenIcon' && '📚'}
        {name === 'HeartPulseIcon' && '🏥'}
        {name === 'ShieldAlertIcon' && '🛡️'}
      </span>
    </div>
  );
};

interface HomeProps {
  user: any;
  complaints: Complaint[];
  setComplaints: React.Dispatch<React.SetStateAction<Complaint[]>>;
  onSelectCategory: (categoryId: string) => void;
  onRedirectToDescribe: () => void;
  language: Language;
  onOpenComplaintDetail: (id: string) => void;
}

export const Home: React.FC<HomeProps> = ({
  user,
  complaints,
  setComplaints,
  onSelectCategory,
  onRedirectToDescribe,
  language,
  onOpenComplaintDetail
}) => {
  const [activeFacingModal, setActiveFacingModal] = useState<Complaint | null>(null);
  const [facingStep, setFacingStep] = useState<'ask' | 'location' | 'success'>('ask');
  const [facingLocation, setFacingLocation] = useState<LocationData | null>(null);
  const [facingNote, setFacingNote] = useState('');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isTransitionActive, setIsTransitionActive] = useState(true);



  // Dynamic live-updating statistics counters (Point 3)
  const [statsReported, setStatsReported] = useState(24853);
  const [statsProgress, setStatsProgress] = useState(14295);
  const [statsSolved, setStatsSolved] = useState(10558);

  useEffect(() => {
    const interval = setInterval(() => {
      const rand = Math.random();
      if (rand < 0.4) {
        setStatsReported(prev => prev + 1);
        setStatsProgress(prev => prev + 1);
      } else if (rand < 0.6) {
        setStatsProgress(prev => Math.max(0, prev - 1));
        setStatsSolved(prev => prev + 1);
      }
    }, 4000); // Live ticks every 4 seconds
    return () => clearInterval(interval);
  }, []);

  const getComplaintImage = (comp: Complaint) => {
    if (comp.evidence && comp.evidence.length > 0 && comp.evidence[0]) {
      return comp.evidence[0];
    }
    const categoryId = (comp.category || '').toLowerCase();
    const sub = (comp.subcategory || '').toLowerCase();
    
    if (sub.includes('pothole') || sub.includes('road') || sub.includes('divider') || sub.includes('sign') || sub.includes('signal') || sub.includes('speed') || categoryId.includes('road')) {
      return '/pothole.jpg';
    }
    if (sub.includes('water') || sub.includes('drain') || sub.includes('sewage') || sub.includes('flow') || categoryId.includes('water')) {
      return '/drainage.jpg';
    }
    if (sub.includes('power') || sub.includes('cut') || sub.includes('voltage') || sub.includes('electricity') || sub.includes('meter') || categoryId.includes('electricity')) {
      return '/power.jpg';
    }
    if (sub.includes('garbage') || sub.includes('waste') || sub.includes('bin') || sub.includes('dump') || sub.includes('toilet') || categoryId.includes('waste')) {
      return '/waste.jpg';
    }
    if (sub.includes('bus') || sub.includes('stop') || sub.includes('transit') || sub.includes('transport') || categoryId.includes('transport')) {
      return '/transport.jpg';
    }
    if (sub.includes('pension') || sub.includes('scheme') || sub.includes('benefit') || sub.includes('scholarship') || categoryId.includes('pension')) {
      return '/pension.jpg';
    }
    if (sub.includes('certificate') || sub.includes('document') || sub.includes('license') || sub.includes('passport') || sub.includes('delay') || categoryId.includes('certificates') || categoryId.includes('gov')) {
      return '/certificates.jpg';
    }
    if (sub.includes('school') || sub.includes('teacher') || sub.includes('education') || sub.includes('exam') || categoryId.includes('education')) {
      return '/education.jpg';
    }
    if (sub.includes('hospital') || sub.includes('doctor') || sub.includes('medicine') || sub.includes('health') || categoryId.includes('healthcare')) {
      return '/healthcare.jpg';
    }
    if (sub.includes('bribe') || sub.includes('corruption') || sub.includes('officer') || sub.includes('misconduct') || categoryId.includes('misconduct')) {
      return '/misconduct.jpg';
    }
    return '/pothole.jpg';
  };
  
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Localize first name & district text
  const localizedFirstName = getLocalizedFirstName(user.name, language);
  const localizedDistrict = language === 'hi' 
    ? `${HINDI_DISTRICTS[user.district] || user.district} ${t.districtText}`
    : `${user.district} ${t.districtText}`;

  // Get localized categories and subcategories
  const localizedCategories = getLocalizedCategories(language);

  // Filter out Resolved complaints from homepage top complaints, only show In Progress or active ones
  const activeComplaints = complaints.filter(c => c.status !== 'Resolved');
  const topComplaints = getLocalizedComplaints(activeComplaints.slice(0, 5), language);

  useEffect(() => {
    if (topComplaints.length <= 1) return;
    const interval = setInterval(() => {
      // Pause carousel if user is actively in the onboarding tour
      if (document.querySelector('.tour-highlight') || !user?.onboardingCompleted) {
        return;
      }
      setIsTransitionActive(true);
      setCarouselIndex(prev => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, [topComplaints.length, user?.onboardingCompleted]);

  // Dynamic initialization of carousel index in the middle clone (Point 9)
  useEffect(() => {
    if (topComplaints && topComplaints.length > 0) {
      setCarouselIndex(topComplaints.length);
    }
  }, [topComplaints?.length]);

  const handleTransitionEnd = () => {
    if (topComplaints.length === 0) return;
    if (carouselIndex >= topComplaints.length * 2) {
      setIsTransitionActive(false);
      setCarouselIndex(carouselIndex - topComplaints.length);
    } else if (carouselIndex < topComplaints.length) {
      setIsTransitionActive(false);
      setCarouselIndex(carouselIndex + topComplaints.length);
    }
  };

  const handleOpenFacing = (complaint: Complaint, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveFacingModal(complaint);
    setFacingStep('ask');
    setFacingLocation(null);
    setFacingNote('');
  };

  const handleConfirmFacing = () => {
    if (!activeFacingModal) return;

    complaintService.joinComplaint(activeFacingModal.id, facingNote, facingLocation?.address);

    setComplaints(prev => prev.map(c => {
      if (c.id === activeFacingModal.id) {
        return {
          ...c,
          affectedCitizenCount: c.affectedCitizenCount + 1,
          joinedByMe: true
        };
      }
      return c;
    }));

    setFacingStep('success');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* Greetings Block - Center Aligned, Large First Sentence, No Emojis */}
      <div style={{
        marginTop: '0.5rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <h1 style={{ 
          fontSize: '2.2rem', 
          fontWeight: 800, 
          color: 'var(--color-primary)',
          letterSpacing: '-0.02em',
          margin: 0
        }}>
          {getDynamicGreeting(language)}, {localizedFirstName}
        </h1>
        <h2 style={{ 
          fontSize: '1.3rem', 
          fontWeight: 600, 
          color: 'var(--color-text-muted)',
          margin: 0
        }}>
          {t.whatHelp}
        </h2>
        <p style={{ 
          color: 'var(--color-text-muted)', 
          fontSize: '0.85rem', 
          maxWidth: '600px', 
          margin: 0 
        }}>
          {t.chooseProblemDesc}
        </p>
      </div>

      {/* Top District Complaints Section - Center Aligned */}
      <section id="top-complaints-section" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.3rem', color: 'var(--color-primary)', margin: 0 }}>
            {t.topComplaints}
          </h3>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            backgroundColor: 'var(--color-primary-light)',
            padding: '0.4rem 0.8rem',
            borderRadius: '20px',
            color: 'var(--color-primary)',
            fontSize: '0.8rem',
            fontWeight: 700
          }}>
            <MapPin size={14} />
            {localizedDistrict}
          </div>
        </div>

        {/* Top Complaints Centered Auto-Scrolling Carousel */}
        <div style={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          padding: '1.2rem 0'
        }}>
          <div 
            onTransitionEnd={handleTransitionEnd}
            style={{
              display: 'flex',
              position: 'relative',
              left: '50%',
              transition: isTransitionActive ? 'transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)' : 'none',
              transform: `translateX(calc(-160px - ${carouselIndex * 340}px))`, // Centers the active card relative to parent center
              gap: '20px',
              width: 'max-content'
            }}
          >
            {(topComplaints.length > 0 ? [...topComplaints, ...topComplaints, ...topComplaints] : []).map((comp, idx) => {
              if (!comp) return null;
              const isCenter = idx === carouselIndex;
              const theme = comp.status === 'Resolved' ? {
                bg: '#10B981', // Solid Green
                border: '#10B981',
                textMain: '#FFFFFF',
                textMuted: '#D1FAE5',
                badgeBg: '#FFFFFF',
                badgeText: '#10B981'
              } : comp.status === 'Needs Attention' ? {
                bg: '#EF4444', // Solid Red
                border: '#EF4444',
                textMain: '#FFFFFF',
                textMuted: '#FEE2E2',
                badgeBg: '#FFFFFF',
                badgeText: '#EF4444'
              } : {
                bg: '#F59E0B', // Solid Yellow/Amber
                border: '#F59E0B',
                textMain: '#FFFFFF',
                textMuted: '#FEF3C7',
                badgeBg: '#FFFFFF',
                badgeText: '#F59E0B'
              };

              return (
                <Parallelogram
                  key={`${comp.id}-${idx}`}
                  onClick={() => onOpenComplaintDetail(comp.id)}
                  wrapperClassName="status-card-wrapper interactive"
                  style={{
                    width: '320px',
                    flexShrink: 0,
                    backgroundColor: theme.bg,
                    padding: 0, // Full bleed image layout
                    border: `1.5px solid ${theme.border}`,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transform: isCenter ? 'scale(1.02)' : 'scale(0.95)',
                    opacity: isCenter ? 1 : 0.5,
                    transition: 'all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)'
                  }}
                >
                  {/* Full-width header image occupying the top space */}
                  <div style={{ height: '150px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                    <img 
                      src={getComplaintImage(comp)} 
                      alt={comp.subcategory || ''} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>

                  {/* Card content text */}
                  <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, color: theme.textMain }}>
                      {comp.subcategory || ''}
                    </h4>
                    
                    {/* Description removed for cleaner, decluttered design */}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: theme.textMuted, fontSize: '0.75rem' }}>
                      <Users size={14} style={{ color: theme.textMain }} />
                      <span><strong>{comp.affectedCitizenCount || 0}</strong> {t.citizensAffected}</span>
                    </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.2rem' }}>
                    <span 
                      id={isCenter ? 'complaint-status-filters-info' : undefined}
                      className="status-badge" 
                      style={{ backgroundColor: theme.badgeBg, color: theme.badgeText, borderColor: theme.border }}
                    >
                      {
                        language === 'hi' ? (comp.status === 'Resolved' ? 'हल किया गया' : comp.status === 'Needs Attention' ? 'ध्यान दें' : 'प्रगति में') :
                        language === 'as' ? (comp.status === 'Resolved' ? 'সমাধান হৈছে' : comp.status === 'Needs Attention' ? 'মনোযোগৰ প্ৰয়োজন' : 'প্ৰক্ৰিয়াধীন') :
                        language === 'bn' ? (comp.status === 'Resolved' ? 'সমাধান করা হয়েছে' : comp.status === 'Needs Attention' ? 'মনোযোগ প্রয়োজন' : 'চলমান') :
                        language === 'ta' ? (comp.status === 'Resolved' ? 'தீர்வு காணப்பட்டது' : comp.status === 'Needs Attention' ? 'கவனம் தேவை' : 'செயல்பாட்டில் உள்ளது') :
                        (comp.status || 'In Progress')
                      }
                    </span>

                    {comp.joinedByMe ? (
                      <span style={{ fontSize: '0.75rem', color: theme.textMain, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Check size={14} /> {
                          language === 'hi' ? 'पंजीकृत' :
                          language === 'as' ? 'পঞ্জীকৃত' :
                          language === 'bn' ? 'নিবন্ধিত' :
                          language === 'ta' ? 'பதிவு செய்யப்பட்டது' :
                          'Registered'
                        }
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleOpenFacing(comp, e)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: theme.textMain,
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.1rem',
                          textDecoration: 'underline'
                        }}
                      >
                        {t.facingToo}
                      </button>
                    )}
                  </div>
                </div>
              </Parallelogram>
            );
          })}
        </div>

        {/* Bullet dot navigation indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.2rem' }}>
          {(topComplaints || []).map((_, idx) => {
            const isActive = (carouselIndex % (topComplaints.length || 1)) === idx;
            return (
              <button
                key={idx}
                onClick={() => {
                  setIsTransitionActive(true);
                  setCarouselIndex(idx + topComplaints.length);
                }}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: isActive ? 'var(--color-primary)' : 'rgba(0,0,0,0.18)',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                aria-label={`Go to slide ${idx + 1}`}
              />
            );
          })}
        </div>
      </div>
    </section>

      {/* Categories Grid Section */}
      <section id="homepage-categories-section" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.3rem', color: 'var(--color-primary)', textAlign: 'center', marginBottom: '0.5rem' }}>
          {t.chooseProblem}
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: '1.2rem'
        }}>
          {localizedCategories.map(cat => {
            // Get category-specific image
            const catImage = cat.illustration || '/document.jpg';

            return (
              <Parallelogram
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                wrapperClassName="card-wrapper interactive"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--bg-card)',
                  padding: 0, // occupy top space
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  overflow: 'hidden'
                }}
              >
                {/* Category Header Image occupying top space */}
                <div style={{ height: '110px', width: '100%', overflow: 'hidden' }}>
                  <img src={catImage} alt={cat.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
                </div>

                <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, color: '#FFFFFF' }}>
                    {cat.title}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-on-card-muted)', lineHeight: '1.4', margin: 0 }}>
                    {cat.description}
                  </p>
                </div>
              </Parallelogram>
            );
          })}
        </div>
      </section>

      {/* Classifier / Help Fallback Section */}
      <section style={{
        backgroundColor: 'var(--bg-card)',
        border: '1.5px solid var(--bg-card)',
        borderRadius: '16px',
        padding: '1.8rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <HelpCircle size={32} style={{ color: '#FFFFFF', flexShrink: 0 }} />
          <div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.2rem', color: '#FFFFFF' }}>
              {t.cantFindProblem}
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-on-card-muted)', lineHeight: '1.4', margin: 0 }}>
              {t.describeInOwnWords}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button 
            onClick={onRedirectToDescribe}
            className="btn-secondary" 
            style={{ borderRadius: '12px', padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}
          >
            <span>{t.btnDescribe}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Yearly History and Records Footer Statistics - Theme Aligned, Large Numbers */}
      <section style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        <div style={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.3rem'
        }}>
          <h3 style={{ fontSize: '1.3rem', color: 'var(--color-primary)', margin: 0 }}>
            {((language === 'hi' ? 'इस वर्ष का इतिहास और रिकॉर्ड' 
              : language === 'as' ? 'এই বৰ্ষৰ ইতিহাস আৰু ৰেকৰ্ড'
              : language === 'bn' ? 'এই বছরের ইতিহাস এবং রেকর্ড'
              : language === 'ta' ? 'இந்த ஆண்டின் வரலாறு & பதிவுகள்'
              : 'History & Records of This Year'))}
          </h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0 }}>
            {((language === 'hi' ? 'देश भर में शिकायत निवारण के आधिकारिक आँकड़े।'
              : language === 'as' ? 'দেশজুৰি অভিযোগ নিষ্পত্তিৰ চৰকাৰী পৰিসংখ্যা।'
              : language === 'bn' ? 'দেশজুড়ে অভিযোগ নিষ্পত্তির সরকারি পরিসংখ্যান।'
              : language === 'ta' ? 'நாடு முழுவதும் குறை தீர்க்கப்பட்டதற்கான அதிகாரப்பூர்வ புள்ளிவிவரங்கள்।'
              : 'Official statistics of grievance resolutions across the country.'))}
          </p>
        </div>

        <Parallelogram
          wrapperClassName="card-wrapper"
          style={{
            background: 'var(--bg-card)', // solid rich brown background
            border: '1.5px solid var(--bg-card)',
            padding: '2rem 1rem',
            textAlign: 'center'
          }}
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '2.3rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>
                {statsReported.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-on-card-muted)', fontWeight: 600, marginTop: '0.6rem' }}>
                {language === 'hi' ? 'दर्ज शिकायतें' 
                  : language === 'as' ? 'পঞ্জীকৃত অভিযোগ'
                  : language === 'bn' ? 'দাখিলকৃত অভিযোগ'
                  : language === 'ta' ? 'பதிவு செய்யப்பட்ட புகார்கள்'
                  : 'Complaints Reported'}
              </div>
            </div>

            {/* Separator line */}
            <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.2)', borderRight: '1px solid rgba(255, 255, 255, 0.2)' }}>
              <div style={{ fontSize: '2.3rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>
                {statsProgress.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-on-card-muted)', fontWeight: 600, marginTop: '0.6rem' }}>
                {language === 'hi' ? 'प्रगति में' 
                  : language === 'as' ? 'প্ৰক্ৰিয়াধীন'
                  : language === 'bn' ? 'চলমান'
                  : language === 'ta' ? 'செயல்பாட்டில் உள்ளது'
                  : 'In Progress'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2.3rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>
                {statsSolved.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-on-card-muted)', fontWeight: 600, marginTop: '0.6rem' }}>
                {language === 'hi' ? 'हल किया गया' 
                  : language === 'as' ? 'সমাধান হৈছে'
                  : language === 'bn' ? 'সমাধান করা হয়েছে'
                  : language === 'ta' ? 'தீர்வு காணப்பட்டது'
                  : 'Solved'}
              </div>
            </div>
          </div>
        </Parallelogram>
      </section>

      {/* "I'm facing this too" modal dialog box */}
      {activeFacingModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(3px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }} onClick={() => setActiveFacingModal(null)}>
          <div 
            style={{ width: '100%', maxWidth: '420px' }} 
            onClick={(e) => e.stopPropagation()}
            className="animate-fade-in"
          >
            <Parallelogram
              wrapperClassName="card-wrapper"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '2px solid #FFFFFF',
                padding: '1.5rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)'
              }}
            >
              {facingStep === 'ask' && (
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.6rem', color: '#FFFFFF' }}>Are you experiencing the same problem?</h3>
                  <div style={{ 
                    borderLeft: '3px solid #FFFFFF', 
                    paddingLeft: '0.6rem', 
                    fontSize: '0.8rem', 
                    color: 'var(--color-text-on-card-muted)',
                    marginBottom: '1.5rem' 
                  }}>
                    <strong>{activeFacingModal.subcategory}</strong>
                    <p style={{ marginTop: '0.2rem' }}>{activeFacingModal.description}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                    <button 
                      type="button" 
                      onClick={() => setActiveFacingModal(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-on-card-muted)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      Not exactly
                    </button>
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      onClick={() => setFacingStep('location')}
                      style={{ borderRadius: '12px', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                    >
                      Yes, I'm facing this too
                    </button>
                  </div>
                </div>
              )}

              {facingStep === 'location' && (
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem', color: '#FFFFFF' }}>
                    {language === 'hi' ? 'आप इसे कहाँ अनुभव कर रहे हैं?' : 'Where are you experiencing this?'}
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-on-card-muted)', marginBottom: '0.8rem' }}>
                    {language === 'hi' 
                      ? 'स्थान प्रदान करने से अधिकारियों को समस्या के पूरे प्रभाव क्षेत्र का मानचित्रण करने में मदद मिलती है।' 
                      : 'Providing your location helps authorities map the full impact area of the issue.'}
                  </p>
                  
                  <LocationSelector 
                    district={user.district} 
                    onLocationSelect={(loc) => setFacingLocation(loc)} 
                    language={language}
                  />

                  <div style={{ marginTop: '1rem', marginBottom: '1.2rem' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', color: '#FFFFFF' }}>
                      {language === 'hi' ? 'एक टिप्पणी जोड़ें (वैकल्पिक):' : 'Add a note (Optional):'}
                    </label>
                    <textarea 
                      className="form-input"
                      rows={2}
                      style={{
                        border: '1px solid var(--color-border)',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        padding: '0.5rem',
                        fontSize: '0.8rem',
                        width: '100%',
                        resize: 'none',
                        color: '#FFFFFF'
                      }}
                      placeholder="e.g. This happens daily during morning hours..."
                      value={facingNote}
                      onChange={(e) => setFacingNote(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
                    <button 
                      type="button" 
                      onClick={() => setFacingStep('ask')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-on-card-muted)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      Back
                    </button>
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      disabled={!facingLocation}
                      onClick={handleConfirmFacing}
                      style={{ borderRadius: '12px', padding: '0.5rem 1rem' }}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}

              {facingStep === 'success' && (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-resolved-bg)',
                    color: 'var(--color-resolved-text)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto'
                  }}>
                    <Check size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#FFFFFF' }}>
                    Added to Complaint
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-on-card-muted)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                    You have been added to complaint <strong>{activeFacingModal.id}</strong>. 
                    The total affected citizen count has been updated to reflect community backing. You can track updates from My Complaints.
                  </p>
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => setActiveFacingModal(null)}
                    style={{ borderRadius: '12px', width: '100%' }}
                  >
                    Done
                  </button>
                </div>
              )}
            </Parallelogram>
          </div>
        </div>
      )}

      {/* Embedded CSS for Horizontal Carousel scroll look */}
      <style>{`
        .top-complaints-row::-webkit-scrollbar {
          height: 6px;
        }
        .top-complaints-row::-webkit-scrollbar-track {
          background: transparent;
        }
        .top-complaints-row::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 4px;
        }
        .top-complaints-row::-webkit-scrollbar-thumb:hover {
          background: #94A3B8;
        }
      `}</style>
    </div>
  );
};

