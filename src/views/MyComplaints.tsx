import React, { useState } from 'react';
import { ClipboardList, MapPin, Calendar, Clock, ArrowRight, Search } from 'lucide-react';
import type { Complaint, Language, ComplaintStatus } from '../types';
import { getLocalizedComplaints, TRANSLATIONS } from '../mockData';
import { Parallelogram } from '../components/Parallelogram';

interface MyComplaintsProps {
  complaints: Complaint[];
  onOpenDetail: (id: string) => void;
  language: Language;
  onGoHome: () => void;
}

export const MyComplaints: React.FC<MyComplaintsProps> = ({
  complaints = [],
  onOpenDetail,
  language,
  onGoHome
}) => {
  const [activeFilter, setActiveFilter] = useState<ComplaintStatus | 'All'>('All');
  const [searchVal, setSearchVal] = useState('');
  
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Localize complaints safely
  const localizedComplaints = getLocalizedComplaints(complaints || [], language);

  // Exactly three status configuration filters as requested
  const filters: { value: ComplaintStatus; label: string; dotColor: string }[] = [
    { value: 'Resolved', label: t.resolved || 'Resolved', dotColor: '#10B981' },
    { value: 'In Progress', label: t.inProgress || 'In Progress', dotColor: '#F59E0B' },
    { value: 'Needs Attention', label: t.needsAttention || 'Needs Attention', dotColor: '#EF4444' }
  ];

  const handleFilterClick = (filterVal: ComplaintStatus | 'All') => {
    setActiveFilter(filterVal);
  };

  const filteredComplaints = (localizedComplaints || []).filter(c => {
    if (!c) return false;
    const matchesFilter = activeFilter === 'All' || c.status === activeFilter;
    const matchesSearch = 
      (c.subcategory || '').toLowerCase().includes(searchVal.toLowerCase()) ||
      (c.id || '').toLowerCase().includes(searchVal.toLowerCase()) ||
      (c.location?.address || '').toLowerCase().includes(searchVal.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div id="complaint-status-filters-info">
        <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <ClipboardList size={28} />
          {t.myComplaints}
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', margin: '0.3rem 0 0 0' }}>
          {language === 'hi' ? 'अपने द्वारा रिपोर्ट की गई समस्याओं को ट्रैक करें और देखें कि आगे क्या होता है।' : "Track the problems you've reported and see what happens next."}
        </p>
      </div>

      {/* Search and Filters Bar - styled as a card matching the theme */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--bg-card)',
        borderRadius: '16px',
        padding: '1.2rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
      }}>
        {/* Search */}
        <div className="form-input-wrapper" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
          <Search size={18} style={{ color: 'var(--color-text-on-card-muted)', marginRight: '0.5rem' }} />
          <input
            type="text"
            className="form-input"
            placeholder={language === 'hi' ? 'ID, श्रेणी या पते से खोजें...' : "Search by ID, category, or address..."}
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            style={{ color: '#FFFFFF' }}
          />
        </div>

        {/* 3 Status Filter Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }} id="my-complaints-status-filters">
          <Parallelogram
            onClick={() => handleFilterClick('All')}
            style={{
              background: activeFilter === 'All' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: activeFilter === 'All' ? '1.5px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              padding: '0.6rem 0.2rem',
              textAlign: 'center',
              fontWeight: activeFilter === 'All' ? 700 : 500,
              color: '#FFFFFF',
              fontSize: '0.75rem',
              borderRadius: '12px'
            }}
          >
            {language === 'hi' ? 'सभी' : 'All'} ({(complaints || []).length})
          </Parallelogram>

          {filters.map(f => {
            const count = (complaints || []).filter(c => c && c.status === f.value).length;
            const isActive = activeFilter === f.value;
            return (
              <Parallelogram
                key={f.value}
                onClick={() => handleFilterClick(f.value)}
                style={{
                  background: isActive 
                    ? (f.value === 'Resolved' ? '#10B981' : f.value === 'In Progress' ? '#F59E0B' : '#EF4444') 
                    : 'rgba(255, 255, 255, 0.05)',
                  border: isActive 
                    ? `1.5px solid ${f.value === 'Resolved' ? '#10B981' : f.value === 'In Progress' ? '#F59E0B' : '#EF4444'}` 
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer',
                  padding: '0.6rem 0.2rem',
                  textAlign: 'center',
                  fontWeight: isActive ? 700 : 500,
                  color: '#FFFFFF',
                  fontSize: '0.72rem',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3rem'
                }}
              >
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isActive ? '#FFFFFF' : f.dotColor, flexShrink: 0 }} />
                <span>{f.label} ({count})</span>
              </Parallelogram>
            );
          })}
        </div>
      </div>

      {/* Complaints Grid list */}
      {filteredComplaints.length === 0 ? (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1.5px dashed rgba(255, 255, 255, 0.3)',
          borderRadius: '16px',
          padding: '4rem 2rem',
          textAlign: 'center'
        }}>
          <ClipboardList size={48} style={{ color: 'var(--color-text-on-card-muted)', margin: '0 auto 1rem auto' }} />
          <h4 style={{ color: '#FFFFFF', marginBottom: '0.4rem', fontSize: '1rem' }}>
            {language === 'hi' ? 'कोई शिकायत नहीं मिली' : 'No complaints found'}
          </h4>
          <p style={{ color: 'var(--color-text-on-card-muted)', fontSize: '0.8rem', maxWidth: '300px', margin: '0 auto 1.5rem auto' }}>
            {language === 'hi' ? 'हमें आपके द्वारा चुने गए फ़िल्टर से मेल खाती कोई शिकायत नहीं मिली।' : "We couldn't find any complaints matching your active filter."}
          </p>
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={onGoHome}
            style={{ borderRadius: '12px', padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}
          >
            {language === 'hi' ? 'समस्या रिपोर्ट करें' : 'Report a Problem'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredComplaints.map(comp => {
            if (!comp) return null;
            // Find latest timeline event message safely
            const currentEvent = comp.timeline ? (
              comp.timeline.find(e => e && e.status === 'current') || 
              comp.timeline.filter(e => e && e.status === 'completed').pop()
            ) : null;
            
            const theme = comp.status === 'Resolved' ? {
              bg: '#10B981', // Solid Green
              border: '#10B981',
              textMain: '#FFFFFF',
              textMuted: '#D1FAE5',
              badgeBg: '#FFFFFF',
              badgeText: '#10B981',
              updateBg: 'rgba(255, 255, 255, 0.15)'
            } : comp.status === 'Needs Attention' ? {
              bg: '#EF4444', // Solid Red
              border: '#EF4444',
              textMain: '#FFFFFF',
              textMuted: '#FEE2E2',
              badgeBg: '#FFFFFF',
              badgeText: '#EF4444',
              updateBg: 'rgba(255, 255, 255, 0.15)'
            } : {
              bg: '#F59E0B', // Solid Yellow/Amber
              border: '#F59E0B',
              textMain: '#FFFFFF',
              textMuted: '#FEF3C7',
              badgeBg: '#FFFFFF',
              badgeText: '#F59E0B',
              updateBg: 'rgba(255, 255, 255, 0.15)'
            };

            return (
              <Parallelogram
                key={comp.id}
                onClick={() => onOpenDetail(comp.id)}
                wrapperClassName="status-card-wrapper interactive"
                style={{
                  background: theme.bg,
                  border: `1.5px solid ${theme.border}`,
                  padding: '1.2rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.8rem'
                }}
              >
                {/* ID & Date & Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: theme.textMain, letterSpacing: '0.02em' }}>
                      {comp.id}
                    </span>
                    {comp.dateSubmitted && (
                      <span style={{ color: theme.textMuted, fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Calendar size={12} style={{ color: theme.textMain }} /> {new Date(comp.dateSubmitted).toLocaleDateString([], { dateStyle: 'medium' })}
                      </span>
                    )}
                  </div>

                  <span className="status-badge" style={{ backgroundColor: theme.badgeBg, color: theme.badgeText, borderColor: theme.border }}>
                    {
                      language === 'hi' ? (comp.status === 'Resolved' ? 'हल किया गया' : comp.status === 'Needs Attention' ? 'ध्यान दें' : 'प्रगति में') :
                      language === 'as' ? (comp.status === 'Resolved' ? 'সমাধান হৈছে' : comp.status === 'Needs Attention' ? 'মনোযোগৰ প্ৰয়োজন' : 'প্ৰক্ৰিয়াধীন') :
                      language === 'bn' ? (comp.status === 'Resolved' ? 'সমাধান করা হয়েছে' : comp.status === 'Needs Attention' ? 'মনোযোগ প্রয়োজন' : 'চলমান') :
                      language === 'ta' ? (comp.status === 'Resolved' ? 'தீர்வு காணப்பட்டது' : comp.status === 'Needs Attention' ? 'கவனம் தேவை' : 'செயல்பாட்டில் உள்ளது') :
                      (comp.status || 'In Progress')
                    }
                  </span>
                </div>

                {/* Subtopic Title */}
                <div>
                  <h4 style={{ fontSize: '0.98rem', margin: 0, color: theme.textMain }}>
                    {comp.subcategory || ''}
                  </h4>
                  {comp.location?.address && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: theme.textMuted, fontSize: '0.75rem', marginTop: '0.2rem' }}>
                      <MapPin size={12} style={{ color: theme.textMain }} />
                      <span>{comp.location.address}</span>
                    </div>
                  )}
                </div>

                {/* Latest authority log update */}
                <div style={{
                  backgroundColor: theme.updateBg,
                  borderRadius: '12px',
                  padding: '0.6rem 0.8rem',
                  border: `1px solid ${theme.border}`,
                  fontSize: '0.78rem'
                }}>
                  <div style={{ color: theme.textMuted, display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.68rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                    <Clock size={12} style={{ color: theme.textMain }} /> 
                    {language === 'hi' ? 'प्राधिकरण से नवीनतम अपडेट:' : 'LATEST UPDATE FROM AUTHORITY:'}
                  </div>
                  <p style={{ margin: 0, color: theme.textMain, fontStyle: 'italic', lineHeight: 1.3 }}>
                    "{comp.authorityUpdate || currentEvent?.description || (language === 'hi' ? 'शिकायत दर्ज की गई है और विभाग को सौंपी जा रही है।' : 'Complaint registered and queued for department assignment.')}"
                  </p>
                </div>

                {/* Action arrow */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', color: theme.textMain, fontWeight: 700, fontSize: '0.75rem', gap: '0.2rem', alignItems: 'center' }}>
                  {language === 'hi' ? 'प्रगति ट्रैक करें' : 'Track progress'}
                  <ArrowRight size={14} />
                </div>
              </Parallelogram>
            );
          })}
        </div>
      )}
    </div>
  );
};
