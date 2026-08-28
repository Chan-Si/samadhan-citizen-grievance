import React, { useState, useEffect, useRef } from 'react';

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  icon?: React.ReactNode;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          border: '1.5px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          padding: '0.5rem 0.8rem',
          color: '#FFFFFF',
          fontSize: '0.85rem',
          cursor: 'pointer',
          justifyContent: 'space-between',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, minWidth: 0 }}>
          {icon}
          <span style={{ color: '#FFFFFF', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selectedOption?.label}
          </span>
        </div>
        <span style={{ fontSize: '0.6rem', color: 'rgba(255, 255, 255, 0.6)', marginLeft: '0.4rem' }}>▼</span>
      </div>

      {isOpen && (
        <div 
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            width: '100%',
            backgroundColor: '#5F3E2B',
            border: '2px solid #D7CCC8',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
            zIndex: 100,
            maxHeight: '200px',
            overflowY: 'auto',
            padding: '0.3rem 0'
          }}
        >
          {options.map(opt => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              style={{
                padding: '0.5rem 0.8rem',
                color: '#FFFFFF',
                fontSize: '0.85rem',
                cursor: 'pointer',
                backgroundColor: opt.value === value ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                fontWeight: opt.value === value ? 700 : 400,
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = opt.value === value ? 'rgba(255, 255, 255, 0.15)' : 'transparent')}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
