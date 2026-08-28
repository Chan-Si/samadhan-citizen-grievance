import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  HelpCircle, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Grid, 
  Users, 
  ClipboardList, 
  Activity, 
  Bell, 
  User, 
  Bot 
} from 'lucide-react';
import type { Language } from '../types';

interface OnboardingTourProps {
  onComplete: () => void;
  language?: Language;
}

interface TourStep {
  targetId: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  title: Record<Language, string>;
  description: Record<Language, string>;
  preferredPlacement?: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: 'homepage-categories-section',
    icon: Grid,
    preferredPlacement: 'bottom',
    title: {
      en: 'Step 1: Choose a Problem Category',
      hi: 'चरण 1: समस्या की श्रेणी चुनें',
      as: 'পদক্ষেপ ১: সমস্যাৰ শ্ৰেণী বাছক',
      bn: 'পদক্ষেপ ১: সমস্যার বিভাগ নির্বাচন করুন',
      ta: 'படி 1: புகார் வகையைத் தேர்வு செய்யவும்'
    },
    description: {
      en: "Browse 11 civic categories to report issues like roads, water, electricity, pensions, education, or healthcare without needing to know the department.",
      hi: "सड़क, जल, बिजली, पेंशन, शिक्षा या स्वास्थ्य जैसी समस्याओं की रिपोर्ट करने के लिए 11 नागरिक श्रेणियों में से चुनें।",
      as: "পথ, পানী, বিদ্যুৎ, পেঞ্চন, শিক্ষা আদি সমস্যাৰ বাবে ১১টা পৌৰ বিভাগৰ পৰা সহজে বাছনি কৰক।",
      bn: "রাস্তা, জল, বিদ্যুৎ, পেনশন, শিক্ষা বা স্বাস্থ্য সম্পর্কিত সমস্যার জন্য ১১টি বিভাগ থেকে নির্বাচন করুন।",
      ta: "சாலை, குடிநீர், மின்சாரம், ஓய்வூதியம், கல்வி போன்ற புகார்களைப் பதிவு செய்ய 11 வகைகளில் தேர்வு செய்யவும்."
    }
  },
  {
    targetId: 'top-complaints-section',
    icon: Users,
    preferredPlacement: 'bottom',
    title: {
      en: 'Step 2: Top District Complaints',
      hi: 'चरण 2: क्षेत्र की प्रमुख शिकायतें',
      as: 'পদক্ষেপ ২: জিলাৰ প্ৰধান অভিযোগসমূহ',
      bn: 'পদক্ষেপ ২: জেলার প্রধান অভিযোগসমূহ',
      ta: 'படி 2: மாவட்டத்தின் முக்கிய புகார்கள்'
    },
    description: {
      en: "See top active community issues in your area. You can instantly join an existing complaint with one click to amplify community voices.",
      hi: "अपने क्षेत्र की मुख्य समस्याओं को देखें। आप सिर्फ एक क्लिक में किसी भी मौजूदा शिकायत से जुड़ सकते हैं।",
      as: "আপোনাৰ অঞ্চলৰ গুৰুত্বপূৰ্ণ সমস্যাবোৰ চাওক আৰু মাত্ৰ এটা ক্লিকেৰে অভিযোগত অংশ লওক।",
      bn: "আপনার এলাকার প্রধান সমস্যাগুলি দেখুন এবং এক ক্লিকে বিদ্যমান অভিযোগে যুক্ত হন।",
      ta: "உங்கள் பகுதியின் முக்கிய பிரச்சனைகளைப் பார்க்கவும். ஒரே கிளிக்கில் ஏற்கனவே உள்ள புகாரில் இணையலாம்."
    }
  },
  {
    targetId: 'nav-my-complaints',
    icon: ClipboardList,
    preferredPlacement: 'bottom',
    title: {
      en: 'Step 3: Track via My Complaints',
      hi: 'चरण 3: मेरी शिकायतों से ट्रैक करें',
      as: 'পদক্ষেপ ৩: মোৰ অভিযোগসমূহত অনুসৰণ কৰক',
      bn: 'পদক্ষেপ ৩: আমার অভিযোগে ট্র্যাক করুন',
      ta: 'படி 3: எனது புகார்கள் மூலம் கண்காணிக்கவும்'
    },
    description: {
      en: "Monitor every grievance you've filed or joined, inspect live official timelines, and access case reference numbers anytime.",
      hi: "अपनी दर्ज की गई या जुड़ी हुई सभी शिकायतों की लाइव स्थिति और सरकारी समय-सीमा ट्रैक करें।",
      as: "আপুনি দাখিল কৰা সকলো অভিযোগৰ স্থিতি আৰু চৰকাৰী সময়ৰেখা ইয়াত পৰ্যবেক্ষণ কৰক।",
      bn: "আপনার দায়ের করা বা যুক্ত হওয়া প্রতিটি অভিযোগের বর্তমান অবস্থা এবং সময়সীমা ট্র্যাক করুন।",
      ta: "நீங்கள் பதிவு செய்த அல்லது இணைந்த அனைத்துப் புகார்களையும் அதிகாரப்பூர்வ காலவரிசையுடன் கண்காணிக்கவும்."
    }
  },
  {
    targetId: 'complaint-status-filters-info',
    icon: Activity,
    preferredPlacement: 'bottom',
    title: {
      en: 'Step 4: Real-time Status Badges',
      hi: 'चरण 4: रीयल-टाइम स्थिति बैज',
      as: 'পদক্ষেপ ৪: বাস্তৱ-সময়ৰ স্থিতি ব্যাজ',
      bn: 'পদক্ষেপ ৪: রিয়েল-টাইম স্ট্যাটাস ব্যাজ',
      ta: 'படி 4: நேரலை நிலை குறிச்சொற்கள்'
    },
    description: {
      en: "Colored badges show whether a grievance is In Progress, Needs Attention, or Resolved. A case is only closed once you confirm the resolution!",
      hi: "रंग-बिरंगे बैज दिखाते हैं कि शिकायत प्रगति में है, ध्यान देने योग्य है, या हल हो चुकी है। समाधान आपके सत्यापन के बाद ही बंद होता है!",
      as: "ৰঙীন ব্যাজে দেখুৱায় অভিযোগৰ স্থিতি। আপোনাৰ নিশ্চিতকৰণৰ পাছতহে অভিযোগটো সম্পূৰ্ণভাৱে বন্ধ হ'ব!",
      bn: "রঙিন ব্যাজ দেখায় যে অভিযোগটি চলমান, মনোযোগ প্রয়োজন বা সমাধান হয়েছে। আপনার অনুমোদনের পরেই কেসটি বন্ধ হবে!",
      ta: "செயல்பாட்டில், கவனம் தேவை, அல்லது தீர்வு போன்ற நிலைகளைக் காட்டுகிறது. உங்கள் உறுதிப்படுத்தலுக்குப் பிறகே வழக்கு முடிவடையும்!"
    }
  },
  {
    targetId: 'nav-notification-bell',
    icon: Bell,
    preferredPlacement: 'bottom',
    title: {
      en: 'Step 5: Instant Notification Alerts',
      hi: 'चरण 5: त्वरित सूचनाएं और अलर्ट',
      as: 'পদক্ষেপ ৫: তাৎক্ষণিক জাননী সতৰ্কবাৰ্তা',
      bn: 'পদক্ষেপ ৫: তাত্ক্ষণিক বিজ্ঞপ্তি সতর্কতা',
      ta: 'படி 5: உடனடி அறிவிப்பு எச்சரிக்கைகள்'
    },
    description: {
      en: "Receive instant updates when government officers inspect your site, provide progress notes, or upload completion photos.",
      hi: "अधिकारी जब भी आपकी साइट का निरीक्षण करेंगे या काम की फ़ोटो अपलोड करेंगे, आपको तुरंत सूचना मिलेगी।",
      as: "চৰকাৰী विषयাই কামৰ অগ্ৰগতি বা ফটো আপলোড কৰিলে লগে লগে জাননী পাব।",
      bn: "সরকারি কর্মকর্তা যখন আপনার কাজ পরিদর্শন করবেন বা ছবি আপলোড করবেন তখন বিজ্ঞপ্তি পাবেন।",
      ta: "அதிகாரிகள் உங்கள் பகுதியை ஆய்வு செய்யும்போது அல்லது புகைப்படங்களை பதிவேற்றும்போது உடனடி தகவல் பெறவும்."
    }
  },
  {
    targetId: 'profile-settings-info',
    icon: User,
    preferredPlacement: 'bottom',
    title: {
      en: 'Step 6: Profile & Multi-Language',
      hi: 'चरण 6: प्रोफ़ाइल और भाषा प्राथमिकताएं',
      as: 'পদক্ষেপ ৬: প্ৰ\'ফাইল আৰু ভাষা পছন্দ',
      bn: 'পদক্ষেপ ৬: প্রোফাইল এবং ভাষা পছন্দ',
      ta: 'படி 6: சுயவிவரம் மற்றும் மொழி விருப்பங்கள்'
    },
    description: {
      en: "Switch easily between English, Hindi, Assamese, Bengali, and Tamil, adjust your home district, or retake this tour anytime.",
      hi: "आसानी से हिंदी, असमिया, बंगाली, तमिल और अंग्रेजी में भाषा बदलें, अपना जिला सेट करें या टूर फिर से लें।",
      as: "সহজে ভাষা সলনি কৰক, নিজৰ জিলা বাছক বা প্ৰয়োজন হ'লে পুনৰ এই ভ্ৰমণ লওক।",
      bn: "ইংরেজি, হিন্দি, অসমীয়া, বাংলা বা তামিল ভাষায় পরিবর্তন করুন এবং আপনার জেলা সেটিংস পরিচালনা করুন।",
      ta: "ஆங்கிலம், இந்தி, அசாமி, பெங்காலி, தமிழ் மொழிகளுக்கு எளிதாக மாறலாம் மற்றும் மாவட்டத்தை அமைக்கலாம்."
    }
  },
  {
    targetId: 'floating-help-assistant',
    icon: Bot,
    preferredPlacement: 'top',
    title: {
      en: 'Step 7: Samadhan AI Voice Assistant',
      hi: 'चरण 7: समाधान एआई सहायक',
      as: 'পদক্ষেপ ৭: সমাধান এআই সহায়ক',
      bn: 'পদক্ষেপ ৭: সমাধান এআই সহায়ক',
      ta: 'படி 7: சமாதான் ஏஐ குரல் உதவியாளர்'
    },
    description: {
      en: "Unsure where to submit? Speak or type your grievance in everyday language, and our assistant will automatically guide you to the right department.",
      hi: "कहाँ शिकायत करें यह समझ नहीं आ रहा? अपनी भाषा में बोलें या लिखें, एआई सहायक आपको सही विभाग तक पहुंचाएगा।",
      as: "ক'ত অভিযোগ কৰিব বুজি পোৱা নাই? আপোনাৰ ভাষাত কওক বা লিখক, আমাৰ সহায়ক সঠিক বিভাগ বিচাৰি দিব।",
      bn: "কোথায় অভিযোগ করবেন নিশ্চিত নন? আপনার ভাষায় বলুন বা লিখুন, আমাদের এআই আপনাকে সঠিক বিভাগে পৌঁছে দেবে।",
      ta: "எங்குப் புகார் அளிப்பது என்று தெரியவில்லையா? உங்கள் குரல் அல்லது தட்டச்சு மூலம் உதவி பெறலாம்."
    }
  }
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ 
  onComplete,
  language = 'en'
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{
    top: number;
    left: number;
    placement: 'top' | 'bottom' | 'left' | 'right';
    arrowLeft: number;
    arrowTop: number;
  }>({
    top: 100,
    left: 100,
    placement: 'bottom',
    arrowLeft: 50,
    arrowTop: 0
  });

  const stepData = TOUR_STEPS[currentStep];
  const StepIcon = stepData.icon;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;
  const animFrameRef = useRef<number | null>(null);

  // Position calculation helper
  const updatePosition = useCallback(() => {
    const target = document.getElementById(stepData.targetId);
    if (!target) {
      // Graceful fallback to centered bottom position if element not found
      setTargetRect(null);
      const cardWidth = Math.min(420, window.innerWidth - 32);
      setTooltipPos({
        top: window.innerHeight - 260,
        left: (window.innerWidth - cardWidth) / 2,
        placement: 'top',
        arrowLeft: cardWidth / 2,
        arrowTop: 0
      });
      return;
    }

    const rect = target.getBoundingClientRect();
    setTargetRect(rect);

    const cardWidth = Math.min(420, window.innerWidth - 32);
    const cardHeight = 230; // Estimated height for math
    const margin = 14;

    let placement: 'top' | 'bottom' | 'left' | 'right' = stepData.preferredPlacement || 'bottom';
    let top = 0;
    let left = 0;
    let arrowLeft = cardWidth / 2;
    let arrowTop = 0;

    // Check vertical space
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (placement === 'bottom' && spaceBelow < cardHeight + margin && spaceAbove > spaceBelow) {
      placement = 'top';
    } else if (placement === 'top' && spaceAbove < cardHeight + margin && spaceBelow > spaceAbove) {
      placement = 'bottom';
    }

    if (placement === 'bottom') {
      top = rect.bottom + margin;
      left = rect.left + rect.width / 2 - cardWidth / 2;
      arrowTop = -8;
      arrowLeft = rect.left + rect.width / 2 - Math.max(16, Math.min(left, window.innerWidth - cardWidth - 16));
    } else if (placement === 'top') {
      top = rect.top - cardHeight - margin;
      left = rect.left + rect.width / 2 - cardWidth / 2;
      arrowTop = cardHeight - 2;
      arrowLeft = rect.left + rect.width / 2 - Math.max(16, Math.min(left, window.innerWidth - cardWidth - 16));
    } else if (placement === 'left') {
      left = rect.left - cardWidth - margin;
      top = rect.top + rect.height / 2 - cardHeight / 2;
      arrowLeft = cardWidth;
      arrowTop = cardHeight / 2;
    } else {
      left = rect.right + margin;
      top = rect.top + rect.height / 2 - cardHeight / 2;
      arrowLeft = -8;
      arrowTop = cardHeight / 2;
    }

    // Clamp coordinates safely within viewport
    left = Math.max(16, Math.min(left, window.innerWidth - cardWidth - 16));
    top = Math.max(16, Math.min(top, window.innerHeight - cardHeight - 16));
    arrowLeft = Math.max(20, Math.min(arrowLeft, cardWidth - 20));

    setTooltipPos({
      top,
      left,
      placement,
      arrowLeft,
      arrowTop
    });
  }, [stepData]);

  // When step changes: scroll target into view, then compute position
  useEffect(() => {
    // Remove previous highlights
    TOUR_STEPS.forEach(s => {
      const el = document.getElementById(s.targetId);
      if (el) el.classList.remove('tour-highlight');
    });

    const target = document.getElementById(stepData.targetId);
    if (target) {
      target.classList.add('tour-highlight');
      
      // Calculate scroll offset to keep element and potential tooltip in view
      const rect = target.getBoundingClientRect();
      const isVisible = rect.top >= 100 && rect.bottom <= window.innerHeight - 100;
      
      if (!isVisible) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    // Measure after short delay for smooth scroll to settle
    const timer = setTimeout(() => {
      updatePosition();
    }, 150);

    const timer2 = setTimeout(() => {
      updatePosition();
    }, 450);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, [currentStep, stepData.targetId, updatePosition]);

  // Live resize & scroll tracking for seamless alignment
  useEffect(() => {
    const handleScrollOrResize = () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(() => {
        updatePosition();
      });
    };

    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [updatePosition]);

  // Keyboard navigation (Arrow keys & Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleBack();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleComplete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep]);

  // Cleanup highlights on unmount
  useEffect(() => {
    return () => {
      TOUR_STEPS.forEach(s => {
        const el = document.getElementById(s.targetId);
        if (el) el.classList.remove('tour-highlight');
      });
    };
  }, []);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    TOUR_STEPS.forEach(s => {
      const el = document.getElementById(s.targetId);
      if (el) el.classList.remove('tour-highlight');
    });
    onComplete();
  };

  // Localized UI strings
  const textSkip = language === 'hi' ? 'टूर छोड़ें' : language === 'as' ? 'ভ্ৰমণ এৰক' : language === 'bn' ? 'স্কিপ করুন' : language === 'ta' ? 'தவிர்' : 'Skip tour';
  const textBack = language === 'hi' ? 'पीछे' : language === 'as' ? 'পিছলৈ' : language === 'bn' ? 'পেছনে' : language === 'ta' ? 'பின்செல்' : 'Back';
  const textNext = language === 'hi' ? 'अगला' : language === 'as' ? 'পৰৱৰ্তী' : language === 'bn' ? 'পরবর্তী' : language === 'ta' ? 'அடுத்து' : 'Next';
  const textFinish = language === 'hi' ? 'समाप्त' : language === 'as' ? 'সম্পূৰ্ণ' : language === 'bn' ? 'সম্পন্ন' : language === 'ta' ? 'முடிந்தது' : 'Got it!';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      pointerEvents: 'none'
    }}>
      {/* Dynamic SVG Spotlight Backdrop Cutout */}
      <svg 
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'auto',
          transition: 'all 0.3s ease'
        }}
        onClick={handleComplete}
      >
        <defs>
          <mask id="tour-spotlight-mask">
            {/* White base = transparent to user */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black cutout over target element = spotlight window */}
            {targetRect && (
              <rect
                x={Math.max(0, targetRect.left - 6)}
                y={Math.max(0, targetRect.top - 6)}
                width={targetRect.width + 12}
                height={targetRect.height + 12}
                rx="10"
                ry="10"
                fill="black"
                style={{ transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}
              />
            )}
          </mask>
        </defs>
        {/* Dark dimmed backdrop with mask cutout */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(15, 23, 42, 0.48)"
          mask="url(#tour-spotlight-mask)"
        />
      </svg>

      {/* Floating Guided Tour Tooltip Card */}
      <div 
        style={{
          position: 'fixed',
          top: `${tooltipPos.top}px`,
          left: `${tooltipPos.left}px`,
          width: 'calc(100vw - 32px)',
          maxWidth: '400px',
          zIndex: 1001,
          pointerEvents: 'auto',
          transition: 'top 0.4s cubic-bezier(0.16, 1, 0.3, 1), left 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          filter: 'drop-shadow(0 20px 25px rgba(95, 62, 43, 0.25)) drop-shadow(0 8px 10px rgba(0, 0, 0, 0.08))'
        }}
        className="tour-card-anim"
      >
        {/* Pointer Arrow */}
        {targetRect && tooltipPos.placement === 'bottom' && (
          <div 
            style={{
              position: 'absolute',
              top: '-8px',
              left: `${tooltipPos.arrowLeft}px`,
              width: 0,
              height: 0,
              borderLeft: '9px solid transparent',
              borderRight: '9px solid transparent',
              borderBottom: '9px solid #5F3E2B',
              transform: 'translateX(-50%)',
              transition: 'left 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              zIndex: 1002
            }}
          />
        )}
        {targetRect && tooltipPos.placement === 'top' && (
          <div 
            style={{
              position: 'absolute',
              bottom: '-8px',
              left: `${tooltipPos.arrowLeft}px`,
              width: 0,
              height: 0,
              borderLeft: '9px solid transparent',
              borderRight: '9px solid transparent',
              borderTop: '9px solid #5F3E2B',
              transform: 'translateX(-50%)',
              transition: 'left 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              zIndex: 1002
            }}
          />
        )}

        {/* Card Body Container */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '2px solid #5F3E2B',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 12px rgba(95, 62, 43, 0.1)'
        }}>
          {/* Header Bar */}
          <div style={{
            background: 'linear-gradient(135deg, #5F3E2B 0%, #432918 100%)',
            color: '#FFFFFF',
            padding: '0.8rem 1.1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <div style={{
                backgroundColor: 'rgba(239, 235, 233, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                padding: '5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}>
                <StepIcon size={16} />
              </div>
              <span style={{ 
                fontWeight: 700, 
                fontSize: '0.8rem',
                letterSpacing: '0.05em',
                color: '#FFFFFF',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-headings)'
              }}>
                {language === 'hi' ? `मार्गदर्शन • ${currentStep + 1} / ${TOUR_STEPS.length}` : `Interactive Tour • ${currentStep + 1} of ${TOUR_STEPS.length}`}
              </span>
            </div>

            <button 
              onClick={handleComplete} 
              style={{
                background: 'transparent',
                border: 'none',
                color: '#D7CCC8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
                borderRadius: '6px',
                transition: 'color 0.2s ease'
              }}
              title={textSkip}
              aria-label="Close Tour"
            >
              <X size={18} />
            </button>
          </div>

          {/* Progress Mini Bar */}
          <div style={{ width: '100%', height: '3px', backgroundColor: '#EFEBE9' }}>
            <div style={{
              width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%`,
              height: '100%',
              backgroundColor: '#5F3E2B',
              transition: 'width 0.3s ease'
            }} />
          </div>

          {/* Body Content */}
          <div style={{ padding: '1.2rem 1.3rem' }}>
            <h3 style={{ 
              fontSize: '1.08rem', 
              fontWeight: 700, 
              color: 'var(--color-primary, #5F3E2B)',
              fontFamily: 'var(--font-headings)',
              margin: '0 0 0.45rem 0',
              lineHeight: 1.3
            }}>
              {stepData.title[language] || stepData.title.en}
            </h3>

            <p style={{ 
              fontSize: '0.86rem', 
              color: 'var(--color-text-muted, #7D6B60)', 
              fontFamily: 'var(--font-body)',
              margin: '0 0 1.25rem 0', 
              lineHeight: 1.5 
            }}>
              {stepData.description[language] || stepData.description.en}
            </p>

            {/* Action Buttons & Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.2rem' }}>
              <button 
                onClick={handleComplete}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-muted, #7D6B60)',
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  padding: '4px 0',
                  textDecoration: 'underline'
                }}
              >
                {textSkip}
              </button>

              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                <button
                  disabled={currentStep === 0}
                  onClick={handleBack}
                  style={{
                    background: '#EFEBE9',
                    border: '1px solid #D7CCC8',
                    color: currentStep === 0 ? '#A89F91' : 'var(--color-primary, #5F3E2B)',
                    padding: '0.5rem 0.85rem',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <ChevronLeft size={16} />
                  {textBack}
                </button>

                <button
                  onClick={handleNext}
                  style={{
                    background: 'var(--color-primary, #5F3E2B)',
                    border: 'none',
                    color: '#FFFFFF',
                    padding: '0.5rem 1.15rem',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    borderRadius: '8px',
                    boxShadow: '0 3px 10px rgba(95, 62, 43, 0.35)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isLastStep ? textFinish : textNext}
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pulsing Highlighter Style for Target Section */}
      <style>{`
        .tour-highlight {
          position: relative !important;
          z-index: 1000 !important;
          outline: 3px solid #5F3E2B !important;
          outline-offset: 4px;
          border-radius: 12px;
          animation: tourPulse 1.8s infinite cubic-bezier(0.4, 0, 0.6, 1);
        }
        @keyframes tourPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(95, 62, 43, 0.5), 0 0 15px rgba(95, 62, 43, 0.25);
            outline-color: rgba(95, 62, 43, 1);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(95, 62, 43, 0), 0 0 25px rgba(95, 62, 43, 0.4);
            outline-color: rgba(95, 62, 43, 0.5);
          }
        }
        .tour-card-anim {
          animation: cardPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes cardPop {
          0% {
            opacity: 0;
            transform: scale(0.94) translateY(6px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
