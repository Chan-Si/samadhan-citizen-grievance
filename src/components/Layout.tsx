import React, { useState, useRef, useEffect } from 'react';
import { Bell, User, ClipboardList, Home } from 'lucide-react';
import type { Notification, Language } from '../types';
import { Parallelogram } from './Parallelogram';
import { TRANSLATIONS } from '../mockData';

const getLocalizedNotification = (n: { title: string; message: string }, language: string) => {
  if (language !== 'hi') {
    return { title: n.title, message: n.message };
  }

  let title = n.title;
  let message = n.message;

  // Extract ID pattern e.g. GRV-2026-XXXXX
  const idMatch = n.message.match(/GRV-2026-\d+/);
  const complaintId = idMatch ? idMatch[0] : '';

  if (n.title.toLowerCase().includes('assigned') || n.title.includes('सौंपी')) {
    title = 'शिकायत सौंपी गई';
    if (n.message.includes('Water Supply')) {
      message = `आपकी शिकायत ${complaintId} (जलभराव) को जल आपूर्ति और जल निकासी विभाग को सौंप दिया गया है।`;
    } else if (n.message.includes('Waste')) {
      message = `आपकी शिकायत ${complaintId} को कचरा प्रबंधन विभाग को सौंप दिया गया है।`;
    } else if (n.message.includes('Roads')) {
      message = `आपकी शिकायत ${complaintId} को लोक निर्माण विभाग (PWD) को सौंप दिया गया है।`;
    } else {
      message = `आपकी शिकायत ${complaintId} को संबंधित स्थानीय विभाग को सौंप दिया गया है।`;
    }
  } else if (n.title.toLowerCase().includes('action reported') || n.title.toLowerCase().includes('resolved') || n.title.includes('हल') || n.title.toLowerCase().includes('verified')) {
    if (n.title.toLowerCase().includes('verified')) {
      title = 'समाधान सत्यापित';
      message = `आपने सत्यापित किया कि शिकायत ${complaintId} ठीक हो गई है। धन्यवाद!`;
    } else {
      title = 'कार्रवाई की गई: हल';
      message = `प्राधिकारी ने आपकी शिकायत ${complaintId} को हल चिह्नित किया है। कृपया पुष्टि करें कि क्या समस्या वास्तव में हल हो गई है।`;
    }
  } else if (n.title.toLowerCase().includes('information required') || n.title.includes('जानकारी आवश्यक') || n.title.toLowerCase().includes('needs attention')) {
    title = 'अधिक जानकारी आवश्यक';
    if (n.message.includes('Social Welfare')) {
      message = `आपकी शिकायत ${complaintId} पर ध्यान देने की आवश्यकता है। समाज कल्याण विभाग ने बैंक पासबुक सत्यापन का अनुरोध किया है।`;
    } else {
      message = `आपकी शिकायत ${complaintId} पर ध्यान देने की आवश्यकता है। कृपया आवश्यक विवरण/दस्तावेज़ प्रदान करें।`;
    }
  } else if (n.title.toLowerCase().includes('disputed') || n.title.includes('विवादित')) {
    title = 'समाधान विवादित';
    message = `आपने ${complaintId} पर समाधान को विवादित किया है। सत्यापन के लिए वापस सौंपा गया।`;
  } else if (n.title.toLowerCase().includes('received') || n.title.includes('प्राप्त') || n.title.toLowerCase().includes('information received')) {
    title = 'जानकारी प्राप्त हुई';
    message = `${complaintId} के लिए अतिरिक्त दस्तावेज़ लोड किया गया। स्थिति बदलकर प्रगति पर हो गई है।`;
  } else if (n.title.toLowerCase().includes('escalated') || n.title.includes('बढ़ी')) {
    title = 'शिकायत बढ़ी';
    message = `शिकायत ${complaintId} को जिला आयुक्त के पास भेज दिया गया है।`;
  } else if (n.title.toLowerCase().includes('submitted') || n.title.includes('सफलतापूर्वक')) {
    title = 'शिकायत सफलतापूर्वक जमा की गई';
    message = `आपकी शिकायत ${complaintId} दर्ज कर ली गई है और संबंधित विभाग को भेज दी गई है।`;
  }

  return { title, message };
};

interface LayoutProps {
  children: React.ReactNode;
  currentRoute: string;
  setCurrentRoute: (route: string) => void;
  user: any;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  onNotificationClick: (complaintId: string) => void;
  language: Language;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  currentRoute,
  setCurrentRoute,
  user,
  notifications,
  setNotifications,
  onNotificationClick,
  language
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotifItemClick = (n: Notification) => {
    setNotifications(prev =>
      prev.map(item => (item.id === n.id ? { ...item, read: true } : item))
    );
    setShowNotifications(false);
    onNotificationClick(n.complaintId);
  };

  return (
    <div className="app-container">
      {/* Top Header Navigation */}
      <header className="header" style={{
        background: '#FFFFFF',
        borderBottom: '2px solid var(--color-primary)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0.8rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Logo */}
          <div 
            onClick={() => setCurrentRoute('home')} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.6rem', 
              cursor: 'pointer' 
            }}
          >
            <div style={{
              background: 'var(--color-primary)',
              color: '#FFFFFF',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.4rem',
              borderRadius: '8px',
            }}>
              <span>S</span>
            </div>
            <div>
              <h1 style={{ 
                fontSize: '1.4rem', 
                margin: 0, 
                letterSpacing: '-0.02em',
                lineHeight: 1.1 
              }}>{t.title}</h1>
            </div>
          </div>

          {/* Navigation Links */}
          {user && (
            <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="desktop-nav" style={{ display: 'flex', gap: '0.5rem' }}>
                <Parallelogram 
                  onClick={() => setCurrentRoute('home')}
                  wrapperClassName="nav-parallelogram"
                  style={{
                    background: currentRoute === 'home' ? 'var(--color-primary-light)' : 'transparent',
                    border: currentRoute === 'home' ? '1px solid var(--color-primary)' : '1px solid transparent',
                    cursor: 'pointer',
                    padding: '0.5rem 1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                    <Home size={16} />
                    <span>{t.home || 'Home'}</span>
                  </div>
                </Parallelogram>

                <Parallelogram 
                  onClick={() => setCurrentRoute('my-complaints')}
                  wrapperClassName="nav-parallelogram"
                  style={{
                    background: currentRoute === 'my-complaints' ? 'var(--color-primary-light)' : 'transparent',
                    border: currentRoute === 'my-complaints' ? '1px solid var(--color-primary)' : '1px solid transparent',
                    cursor: 'pointer',
                    padding: '0.5rem 1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                    <ClipboardList size={16} />
                    <span>{t.myComplaints}</span>
                  </div>
                </Parallelogram>

                <Parallelogram 
                  onClick={() => setCurrentRoute('profile')}
                  wrapperClassName="nav-parallelogram"
                  style={{
                    background: currentRoute === 'profile' ? 'var(--color-primary-light)' : 'transparent',
                    border: currentRoute === 'profile' ? '1px solid var(--color-primary)' : '1px solid transparent',
                    cursor: 'pointer',
                    padding: '0.5rem 1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                    <User size={16} />
                    <span>{t.profile}</span>
                  </div>
                </Parallelogram>
              </div>

              {/* Notification icon */}
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative'
                  }}
                  id="nav-notification-bell"
                  aria-label="Notifications"
                >
                  <Bell size={24} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      background: 'var(--color-attention-bg)',
                      color: 'var(--color-attention-text)',
                      border: '1.5px solid var(--color-attention-border)',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      fontSize: '0.7rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold'
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    width: '320px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    zIndex: 100,
                    marginTop: '0.5rem'
                  }}>
                    <div style={{
                      padding: '0.75rem 1rem',
                      borderBottom: '1px solid var(--color-border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: 'var(--color-primary-light)'
                    }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--color-primary)', fontSize: '0.9rem' }}>{t.notifications || 'Notifications'}</span>
                      {unreadCount > 0 && (
                        <button 
                          onClick={handleMarkAllRead}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-primary)',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            fontWeight: 500
                          }}
                        >
                          {t.markAllRead || 'Mark all read'}
                        </button>
                      )}
                    </div>
                    <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                          {t.noNotifications || 'No notifications'}
                        </div>
                      ) : (
                        notifications.map(n => {
                          const localized = getLocalizedNotification(n, language);
                          return (
                            <div 
                              key={n.id}
                              onClick={() => handleNotifItemClick(n)}
                              style={{
                                padding: '0.75rem 1rem',
                                borderBottom: '1px solid #F1F5F9',
                                cursor: 'pointer',
                                backgroundColor: n.read ? '#FFFFFF' : '#F8FAFC',
                                borderLeft: n.read ? '3px solid transparent' : '3px solid var(--color-primary)',
                                transition: 'background-color 0.2s'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                <span style={{ fontWeight: n.read ? 600 : 700, fontSize: '0.85rem', color: 'var(--color-text-main)' }}>
                                  {localized.title}
                                </span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                                  {new Date(n.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0, lineClamp: 2 }}>
                                {localized.message}
                              </p>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

            </nav>
          )}
        </div>

        {/* Mobile Navigation bar */}
        {user && (
          <div className="mobile-nav" style={{
            display: 'none',
            borderTop: '1px solid var(--color-border)',
            backgroundColor: '#FFFFFF',
            justifyContent: 'space-around',
            padding: '0.5rem 0'
          }}>
            <button 
              onClick={() => setCurrentRoute('home')}
              style={{
                background: 'transparent',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: currentRoute === 'home' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                fontSize: '0.7rem',
                fontWeight: currentRoute === 'home' ? 600 : 400
              }}
            >
              <Home size={20} />
              <span>{t.home || 'Home'}</span>
            </button>
            <button 
              onClick={() => setCurrentRoute('my-complaints')}
              style={{
                background: 'transparent',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: currentRoute === 'my-complaints' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                fontSize: '0.7rem',
                fontWeight: currentRoute === 'my-complaints' ? 600 : 400
              }}
            >
              <ClipboardList size={20} />
              <span>{t.myComplaints || 'Complaints'}</span>
            </button>
            <button 
              onClick={() => setCurrentRoute('profile')}
              style={{
                background: 'transparent',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: currentRoute === 'profile' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                fontSize: '0.7rem',
                fontWeight: currentRoute === 'profile' ? 600 : 400
              }}
            >
              <User size={20} />
              <span>{t.profile || 'Profile'}</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Body Wrap */}
      <main className="main-content">
        {children}
      </main>

      {/* Add layout css tags directly in style tags if necessary */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-nav {
            display: flex !important;
          }
        }
        .nav-parallelogram {
          border-radius: 12px !important;
          overflow: hidden;
          transition: background-color 0.2s, border-color 0.2s;
        }
        .nav-parallelogram:hover {
          background-color: var(--color-primary-light) !important;
          border-color: var(--color-primary) !important;
        }
      `}</style>
    </div>
  );
};
