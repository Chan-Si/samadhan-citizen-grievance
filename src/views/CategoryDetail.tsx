import React from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Language } from '../types';
import { getLocalizedCategories } from '../mockData';
import { Parallelogram } from '../components/Parallelogram';

interface CategoryDetailProps {
  categoryId: string;
  onSelectSubtopic: (subtopicId: string) => void;
  onBack: () => void;
  language: Language;
}

export const CategoryDetail: React.FC<CategoryDetailProps> = ({
  categoryId,
  onSelectSubtopic,
  onBack,
  language
}) => {
  // Get fully localized categories & subtopics based on current language
  const localizedCategories = getLocalizedCategories(language);
  const category = localizedCategories.find(c => c.id === categoryId);

  if (!category) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
        <p>Category not found.</p>
        <button className="btn-primary" onClick={onBack}>Go Back</button>
      </div>
    );
  }

  // Get AI generated banner image path based on category ID
  const catImage = category?.illustration || '/document.jpg';

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
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
          {language === 'hi' ? 'श्रेणियों पर वापस जाएं' : 'Back to Categories'}
        </button>
      </div>

      {/* Header Info - Center Aligned */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
        <h1 style={{ fontSize: '2.4rem', color: 'var(--color-primary)', margin: 0, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
          {category.title}
        </h1>
        <h2 style={{ fontSize: '1.4rem', color: 'var(--color-text-main)', marginTop: '0.4rem', marginBottom: '0.2rem', fontWeight: 700 }}>
          {language === 'hi' ? 'समस्या क्या है?' : 'What is the problem?'}
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>
          {language === 'hi' ? 'उस विकल्प को चुनें जो आपकी समस्या का सबसे अच्छा वर्णन करता है।' : 'Choose the option that best describes your problem.'}
        </p>
      </div>

      {/* Subtopics Grid - Image occupies top space, no emojis */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
        gap: '1.2rem',
        marginTop: '0.5rem'
      }}>
        {category.subtopics.map(sub => (
          <Parallelogram
            key={sub.id}
            onClick={() => onSelectSubtopic(sub.id)}
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
            {/* AI Generated image banner at the top of the card */}
            <div style={{ height: '110px', width: '100%', overflow: 'hidden' }}>
              <img 
                src={sub.illustration || catImage} 
                alt={sub.title} 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover', 
                  opacity: 0.95 
                }} 
              />
            </div>

            <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, color: '#FFFFFF' }}>
                {sub.title}
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-on-card-muted)', lineHeight: '1.3', margin: 0 }}>
                {sub.description}
              </p>
            </div>
          </Parallelogram>
        ))}
      </div>
    </div>
  );
};
