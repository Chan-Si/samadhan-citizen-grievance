import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import type { TimelineEvent } from '../types';

interface ComplaintTimelineProps {
  events: TimelineEvent[];
}

export const ComplaintTimeline: React.FC<ComplaintTimelineProps> = ({ events }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', margin: '1rem 0', paddingLeft: '0.5rem' }}>
      {events.map((event, idx) => {
        let Icon = Circle;
        let color = 'var(--color-text-on-card-muted)';
        let fontStyle: any = { fontWeight: 500, color: 'var(--color-text-on-card-muted)' };

        if (event.status === 'completed') {
          Icon = CheckCircle2;
          color = '#34D399'; // High-contrast green
          fontStyle = { fontWeight: 600, color: '#34D399' };
        } else if (event.status === 'current') {
          Icon = Clock;
          color = '#F59E0B'; // Amber
          fontStyle = { fontWeight: 700, color: '#FFFFFF' };
        } else if (event.status === 'upcoming') {
          Icon = Circle;
          color = 'var(--color-text-on-card-muted)';
        }

        return (
          <div 
            key={idx} 
            style={{ 
              display: 'flex', 
              gap: '1.2rem', 
              position: 'relative'
            }}
          >
            {/* Timeline dot/icon wrapper */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              width: '24px',
              flexShrink: 0
            }}>
              <div style={{
                backgroundColor: 'var(--bg-card)', // Blends into brown background
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                color: color,
                zIndex: 2
              }}>
                <Icon size={20} style={{ fill: event.status === 'completed' ? 'rgba(52, 211, 153, 0.15)' : 'transparent' }} />
              </div>
              
              {/* Connecting line segment running strictly in between dots */}
              {idx < events.length - 1 && (
                <div style={{
                  position: 'absolute',
                  top: '24px',
                  bottom: '-24px', // Extends down to next dot
                  width: '2px',
                  backgroundColor: 'var(--color-border)',
                  opacity: 0.4,
                  zIndex: 1
                }} />
              )}
            </div>

            {/* Event detail */}
            <div style={{ flex: 1, paddingTop: '0.1rem' }}>
              <span style={{ 
                display: 'block', 
                fontSize: '0.88rem', 
                ...fontStyle
              }}>
                {event.title}
              </span>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-on-card-muted)', margin: '0.2rem 0 0.4rem 0', lineHeight: 1.4 }}>
                {event.description}
              </p>
              <span style={{ fontSize: '0.68rem', color: 'var(--color-text-on-card-muted)', opacity: 0.8, fontWeight: 500 }}>
                {new Date(event.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
