import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { OnboardingTour } from './components/OnboardingTour';
import { ChatAssistant } from './components/ChatAssistant';
import { Login } from './views/Login';
import { Home } from './views/Home';
import { CategoryDetail } from './views/CategoryDetail';
import { ComplaintFormContainer } from './views/ComplaintFormContainer';
import { ReviewComplaint } from './views/ReviewComplaint';
import { SuccessScreen } from './views/SuccessScreen';
import { MyComplaints } from './views/MyComplaints';
import { ComplaintDetailView } from './views/ComplaintDetailView';
import { ProfileView } from './views/ProfileView';

import type { UserProfile, Complaint, Notification, Language } from './types';
import { 
  INITIAL_COMPLAINTS, 
  MOCK_NOTIFICATIONS, 
  LOCAL_CLASSIFIER_KEYWORDS, 
  getLocalizedCategories
} from './mockData';
import { STATES_AND_DISTRICTS } from './statesAndDistricts';

const getStateForDistrict = (dist: string): string => {
  for (const [state, districts] of Object.entries(STATES_AND_DISTRICTS)) {
    if (districts.includes(dist)) {
      return state;
    }
  }
  return 'Assam';
};

const adjustComplaintsForUser = (initialComplaints: Complaint[], district: string, state: string): Complaint[] => {
  return initialComplaints.map(c => {
    const address = (c.location?.address || '')
      .replace(/Kamrup Metropolitan/g, district)
      .replace(/Guwahati/g, district)
      .replace(/Dispur/g, district)
      .replace(/Assam/g, state);

    const responsibleDepartment = (c.responsibleDepartment || '')
      .replace(/Kamrup Metropolitan/g, district)
      .replace(/Guwahati/g, district)
      .replace(/Dispur/g, district)
      .replace(/Assam/g, state);

    const timeline = (c.timeline || []).map(t => ({
      ...t,
      description: (t.description || '')
        .replace(/Kamrup Metropolitan/g, district)
        .replace(/Guwahati/g, district)
        .replace(/Dispur/g, district)
        .replace(/Assam/g, state)
    }));

    return {
      ...c,
      location: {
        ...c.location,
        address,
        district
      },
      responsibleDepartment,
      timeline
    };
  });
};
import { Mic, MicOff, HelpCircle } from 'lucide-react';
import { Parallelogram } from './components/Parallelogram';

function App() {
  // Global States (synchronized with localStorage for full backend-like behavior)
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('samadhan_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.mobile === '8837000452' || parsed.mobile === '9876543210') {
        parsed.name = 'Riya';
        parsed.state = 'Karnataka';
        parsed.district = 'Bangalore Urban';
        parsed.residence = 'House 42, 5th Cross, Indiranagar';
        parsed.pincode = '560038';
        localStorage.setItem('samadhan_user', JSON.stringify(parsed));
      }
      return parsed;
    }
    return null;
  });

  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem('samadhan_complaints');
    return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('samadhan_notifications');
    return saved ? JSON.parse(saved) : MOCK_NOTIFICATIONS;
  });

  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('samadhan_lang');
    return (saved as Language) || 'en';
  });

  // Routing State
  const [currentRoute, setCurrentRoute] = useState<string>('home');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedSubtopicId, setSelectedSubtopicId] = useState<string>('');
  const [activeComplaintId, setActiveComplaintId] = useState<string>('');
  const [draftComplaint, setDraftComplaint] = useState<Partial<Complaint>>({});
  
  // "Can't find your problem" / "Describe problem" flow states
  const [describeText, setDescribeText] = useState('');
  const [isRecordingDesc, setIsRecordingDesc] = useState(false);
  const [classificationResult, setClassificationResult] = useState<{ categoryId: string; subtopicId: string } | null>(null);
  const [classificationAttempted, setClassificationAttempted] = useState(false);

  // Safe Navigation Helper
  const navigateTo = (routeHash: string) => {
    window.location.hash = routeHash;
  };

  const handleGoBack = () => {
    if (window.location.hash === '#home' || !window.location.hash) {
      navigateTo('home');
    } else {
      window.history.back();
    }
  };

  // Hash-based Router Sync
  useEffect(() => {
    const handleHashChange = () => {
      // If not logged in, force login view
      const savedUser = localStorage.getItem('samadhan_user');
      if (!savedUser && !user) {
        setCurrentRoute('login');
        return;
      }

      const hash = window.location.hash.replace('#', '') || 'home';
      const parts = hash.split('/');
      const route = parts[0];

      if (route === 'home') {
        setCurrentRoute('home');
      } else if (route === 'category-detail' && parts[1]) {
        setSelectedCategoryId(parts[1]);
        setCurrentRoute('category-detail');
      } else if (route === 'complaint-form' && parts[1] && parts[2]) {
        setSelectedCategoryId(parts[1]);
        setSelectedSubtopicId(parts[2]);
        setCurrentRoute('complaint-form');
      } else if (route === 'review') {
        setCurrentRoute('review');
      } else if (route === 'success' && parts[1]) {
        setActiveComplaintId(parts[1]);
        setCurrentRoute('success');
      } else if (route === 'my-complaints') {
        setCurrentRoute('my-complaints');
      } else if (route === 'complaint-detail' && parts[1]) {
        setActiveComplaintId(parts[1]);
        setCurrentRoute('complaint-detail');
      } else if (route === 'profile') {
        setCurrentRoute('profile');
      } else if (route === 'describe-problem') {
        setCurrentRoute('describe-problem');
      } else {
        setCurrentRoute('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Parse on startup
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [user]);

  // Sync state to local storage
  useEffect(() => {
    if (user) {
      localStorage.setItem('samadhan_user', JSON.stringify(user));
      localStorage.setItem('samadhan_lang', user.preferredLanguage);
      setLanguage(user.preferredLanguage);

      // Adjust mock complaints to match user's district and state
      const resolvedState = getStateForDistrict(user.district);
      const saved = localStorage.getItem('samadhan_complaints');
      const base = saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
      setComplaints(adjustComplaintsForUser(base, user.district, resolvedState));
    } else {
      localStorage.removeItem('samadhan_user');
      window.location.hash = '';
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('samadhan_complaints', JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem('samadhan_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Utility to generate a new notification
  const handleAddNotification = (title: string, message: string, complaintId: string) => {
    const newNotif: Notification = {
      id: `n-${Date.now()}`,
      title,
      message,
      date: new Date().toISOString(),
      complaintId,
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Local rule-based classifier (Interface boundary ready for future LLM integration)
  const classifyText = (text: string): { categoryId: string; subtopicId: string } | null => {
    const query = text.toLowerCase();
    for (const rule of LOCAL_CLASSIFIER_KEYWORDS) {
      for (const kw of rule.keywords) {
        if (query.includes(kw)) {
          return { categoryId: rule.category, subtopicId: rule.subtopic };
        }
      }
    }
    return null;
  };

  const handleDescribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!describeText.trim()) return;

    const result = classifyText(describeText);
    setClassificationResult(result);
    setClassificationAttempted(true);
  };

  const handleConfirmClassification = (accepted: boolean) => {
    if (accepted && classificationResult) {
      // Prefill draft complaint description
      setDraftComplaint({
        description: describeText
      });
      setSelectedCategoryId(classificationResult.categoryId);
      setSelectedSubtopicId(classificationResult.subtopicId);
      setDescribeText('');
      setClassificationAttempted(false);
      setClassificationResult(null);
      navigateTo(`complaint-form/${classificationResult.categoryId}/${classificationResult.subtopicId}`);
    } else {
      // Revert to category grid
      setDescribeText('');
      setClassificationAttempted(false);
      setClassificationResult(null);
      navigateTo('home');
    }
  };

  // Mock voice transcription for the "describe-problem" flow
  const handleVoiceInput = () => {
    setIsRecordingDesc(true);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      rec.continuous = false;
      rec.interimResults = false;
      
      rec.onresult = (e: any) => {
        if (e.results && e.results[0] && e.results[0][0]) {
          setDescribeText(e.results[0][0].transcript);
        }
      };
      rec.onerror = (err: any) => {
        console.error("Speech recognition error:", err);
        simulateMockVoice();
      };
      rec.onend = () => {
        setIsRecordingDesc(false);
      };
      rec.start();
    } else {
      simulateMockVoice();
    }
  };

  const simulateMockVoice = () => {
    setTimeout(() => {
      setDescribeText("My pension payment has not arrived for three months.");
      setIsRecordingDesc(false);
    }, 2000);
  };

  // Auth logout handler
  const handleLogout = () => {
    setUser(null);
    navigateTo('');
  };

  // Notification click handler (redirects to the specific tracking ticket details)
  const handleNotificationClick = (complaintId: string) => {
    navigateTo(`complaint-detail/${complaintId}`);
  };

  // Form submission handler
  const handleFormSubmit = (data: Partial<Complaint>) => {
    setDraftComplaint(prev => ({ ...prev, ...data }));
    navigateTo('review');
  };

  // Final ticket generation
  const handleFinalSubmit = (overrideData?: Partial<Complaint>) => {
    const randomIdNum = Math.floor(100 + Math.random() * 900);
    const grievanceId = `GRV-2026-00${randomIdNum}`;
    const mergedComplaint = { ...draftComplaint, ...overrideData };

    const dept = mergedComplaint.responsibleDepartment || 'District Administration';

    const newTimeline = [
      { title: 'Complaint submitted', description: 'Complaint successfully filed by citizen.', date: new Date().toISOString().split('T')[0], status: 'completed' as const },
      { title: 'Assigned to authority', description: `Assigned to ${dept}.`, date: new Date().toISOString().split('T')[0], status: 'current' as const },
      { title: 'Site inspection', description: 'Pending officer site deployment.', date: '', status: 'upcoming' as const }
    ];

    const finalComplaint: Complaint = {
      ...(mergedComplaint as Complaint),
      id: grievanceId,
      userId: 'demo-user',
      status: 'In Progress',
      dateSubmitted: new Date().toISOString().split('T')[0],
      timeline: newTimeline,
      citizenVerification: 'None',
      affectedCitizenCount: mergedComplaint.affectedCitizenCount || 1,
      responsibleDepartment: dept
    };

    setComplaints(prev => [finalComplaint, ...prev]);
    handleAddNotification(
      'Complaint Submitted Successfully',
      `Your complaint ${grievanceId} is filed and routed to the ${dept}.`,
      grievanceId
    );

    // Save active reference for success screen redirect
    setActiveComplaintId(grievanceId);
    navigateTo(`success/${grievanceId}`);
  };

  // View Switcher (Custom Client-side router)
  const renderView = () => {
    if (!user) {
      return (
        <Login 
          language={language}
          setLanguage={setLanguage}
          onLoginSuccess={(profile) => {
            setUser(profile);
            navigateTo('home');
          }} 
        />
      );
    }

    switch (currentRoute) {
      case 'home':
        return (
          <Home
            user={user}
            complaints={complaints}
            setComplaints={setComplaints}
            onSelectCategory={(id) => navigateTo(`category-detail/${id}`)}
            onRedirectToDescribe={() => navigateTo('describe-problem')}
            language={language}
            onOpenComplaintDetail={(id) => navigateTo(`complaint-detail/${id}`)}
          />
        );

      case 'describe-problem':
        return (
          <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <button
                onClick={handleGoBack}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                ← Back
              </button>
            </div>

            <div>
              <h2 style={{ fontSize: '1.6rem', color: 'var(--color-primary)', marginBottom: '0.4rem' }}>
                {language === 'hi' ? 'अपनी समस्या के बारे में बताएं' : 'Tell us about your problem'}
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
                {language === 'hi' ? 'अपनी समस्या का वर्णन अपने शब्दों में करें।' : 'Describe what happened in your own words.'}
              </p>
            </div>

            {!classificationAttempted ? (
              <>
                <Parallelogram
                  wrapperClassName="card-wrapper"
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid var(--color-border)',
                    padding: '2rem'
                  }}
                >
                  <form onSubmit={handleDescribeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div style={{ position: 'relative' }}>
                      <textarea
                        className="form-input"
                        rows={5}
                        required
                        placeholder={isRecordingDesc 
                          ? (language === 'hi' ? 'सुन रहा हूँ... कृपया बोलें...' : 'Listening... Please speak...') 
                          : (language === 'hi' ? 'जैसे: मेरी दादी का वृद्धावस्था पेंशन पिछले तीन महीनों से नहीं मिला है...' : "e.g. My grandmother's old age pension has not arrived for three months. We updated the details but nothing happened...")
                        }
                        value={describeText}
                        onChange={(e) => setDescribeText(e.target.value)}
                        style={{
                          border: '1.5px solid var(--color-border)',
                          borderRadius: '8px',
                          padding: '0.8rem',
                          width: '100%',
                          resize: 'none',
                          color: '#000000',
                          backgroundColor: '#FFFFFF'
                        }}
                      />
                      
                      {/* Floating mic icon inside text area */}
                      <button
                        type="button"
                        onClick={handleVoiceInput}
                        style={{
                          position: 'absolute',
                          bottom: '12px',
                          right: '12px',
                          backgroundColor: isRecordingDesc ? '#EF4444' : '#F1F5F9',
                          color: isRecordingDesc ? '#FFFFFF' : 'var(--color-text-muted)',
                          border: 'none',
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: isRecordingDesc ? '0 0 0 0 rgba(239, 68, 68, 0.7)' : 'none',
                          animation: isRecordingDesc ? 'pulse-red 1.5s infinite' : 'none'
                        }}
                        title="Speak instead"
                      >
                        {isRecordingDesc ? <MicOff size={18} className="spinner" style={{ animation: 'spin 1.5s infinite linear' }} /> : <Mic size={18} />}
                      </button>
                    </div>

                    {isRecordingDesc && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#EF4444', fontSize: '0.8rem', fontWeight: 600, justifyContent: 'center' }}>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                        <span>{language === 'hi' ? 'सुन रहा हूँ... बोलना शुरू करें' : 'Listening... speak now'}</span>
                      </div>
                    )}

                    <button 
                      type="submit" 
                      className="btn-primary" 
                      style={{ borderRadius: '12px', width: '100%' }}
                      disabled={!describeText.trim() || isRecordingDesc}
                    >
                      {language === 'hi' ? 'जारी रखें' : 'Continue'}
                    </button>
                  </form>
                </Parallelogram>

              </>
            ) : (
              <Parallelogram
                wrapperClassName="card-wrapper"
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid var(--color-primary)',
                  padding: '2rem',
                  textAlign: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>
                  <HelpCircle size={20} />
                  Here's what we understood
                </div>

                {classificationResult ? (
                  <div style={{ marginBottom: '2rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>CLASSIFIED CATEGORY</div>
                    <strong style={{ fontSize: '1.3rem', color: 'var(--color-primary)', display: 'block', margin: '0.3rem 0 1rem 0' }}>
                      {getLocalizedCategories(language).find((c: any) => c.id === classificationResult.categoryId)?.title}
                    </strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>IDENTIFIED PROBLEM TYPE</div>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--color-text-main)' }}>
                      {getLocalizedCategories(language).find((c: any) => c.id === classificationResult.categoryId)?.subtopics.find((s: any) => s.id === classificationResult.subtopicId)?.title}
                    </strong>
                  </div>
                ) : (
                  <div style={{ marginBottom: '2rem' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                      We couldn't automatically match this to a specific problem type. Please select the category manually from the Home screen.
                    </p>
                  </div>
                )}

                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                  Does this look right?
                </p>

                <div style={{ display: 'flex', gap: '0.8rem' }}>
                  <button
                    onClick={() => handleConfirmClassification(false)}
                    className="btn-secondary"
                    style={{ flex: 1, borderRadius: '12px' }}
                  >
                    No, choose another
                  </button>
                  {classificationResult && (
                    <button
                      onClick={() => handleConfirmClassification(true)}
                      className="btn-primary"
                      style={{ flex: 1.5, borderRadius: '12px' }}
                    >
                      Yes, continue
                    </button>
                  )}
                </div>
              </Parallelogram>
            )}
          </div>
        );

      case 'category-detail':
        return (
          <CategoryDetail
            categoryId={selectedCategoryId}
            onBack={handleGoBack}
            onSelectSubtopic={(subId) => {
              setSelectedSubtopicId(subId);
              setDraftComplaint({});
              navigateTo(`complaint-form/${selectedCategoryId}/${subId}`);
            }}
            language={language}
          />
        );

      case 'complaint-form':
        return (
          <ComplaintFormContainer
            categoryId={selectedCategoryId}
            subtopicId={selectedSubtopicId}
            user={user}
            onSubmit={handleFormSubmit}
            onBack={handleGoBack}
            language={language}
          />
        );

      case 'review':
        return (
          <ReviewComplaint
            formData={draftComplaint}
            user={user}
            onEdit={handleGoBack}
            onSubmit={(overrideData) => handleFinalSubmit(overrideData)}
            language={language}
          />
        );

      case 'success':
        return (
          <SuccessScreen
            grievanceId={activeComplaintId}
            department={draftComplaint.responsibleDepartment || ''}
            onTrack={() => navigateTo(`complaint-detail/${activeComplaintId}`)}
            onGoHome={() => navigateTo('home')}
            language={language}
          />
        );

      case 'my-complaints':
        return (
          <MyComplaints
            complaints={complaints}
            onOpenDetail={(id) => navigateTo(`complaint-detail/${id}`)}
            onGoHome={() => navigateTo('home')}
            language={language}
          />
        );

      case 'complaint-detail':
        return (
          <ComplaintDetailView
            complaintId={activeComplaintId}
            complaints={complaints}
            setComplaints={setComplaints}
            onBack={handleGoBack}
            language={language}
            onAddNotification={handleAddNotification}
          />
        );

      case 'profile':
        return (
          <ProfileView
            user={user}
            setUser={setUser}
            onLogout={handleLogout}
            language={language}
            setLanguage={setLanguage}
            onRetakeTour={() => {
              setUser(prev => prev ? { ...prev, onboardingCompleted: false } : null);
              navigateTo('home');
            }}
          />
        );

      default:
        return (
          <Home 
            user={user} 
            complaints={complaints} 
            setComplaints={setComplaints} 
            onSelectCategory={(id) => navigateTo(`category-detail/${id}`)} 
            onRedirectToDescribe={() => navigateTo('describe-problem')} 
            language={language} 
            onOpenComplaintDetail={(id) => navigateTo(`complaint-detail/${id}`)} 
          />
        );
    }
  };

  return (
    <Layout
      currentRoute={currentRoute}
      setCurrentRoute={navigateTo}
      user={user}
      notifications={notifications}
      setNotifications={setNotifications}
      onNotificationClick={handleNotificationClick}
      language={language}
    >
      {/* Onboarding Tour spotlight overlay (Triggers on first Home visit) */}
      {user && !user.onboardingCompleted && currentRoute === 'home' && (
        <OnboardingTour
          onComplete={() => {
            setUser(prev => prev ? { ...prev, onboardingCompleted: true } : null);
          }}
        />
      )}

      {/* Renders Active Sub-View */}
      {renderView()}

      {/* Floating conversational bot support assistant (Visible after login) */}
      {user && (
        <ChatAssistant
          language={language}
          onRedirectToCategory={(catId) => {
            setSelectedCategoryId(catId);
            navigateTo(`category-detail/${catId}`);
          }}
        />
      )}
    </Layout>
  );
}

export default App;
