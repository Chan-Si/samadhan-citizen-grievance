import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Navigation, AlertTriangle, Check } from 'lucide-react';
import type { LocationData, Language } from '../types';
import { Parallelogram } from './Parallelogram';
import { STATES_AND_DISTRICTS } from '../statesAndDistricts';

interface LocationSelectorProps {
  initialLocation?: LocationData;
  onLocationSelect: (location: LocationData) => void;
  district: string;
  language: Language;
}

// Fixed mock map coordinate reference mapping to mock streets/landmarks
interface Landmark {
  name: string;
  x: number;
  y: number;
  address: string;
}

const getDistrictMapData = (dist: string) => {
  switch (dist) {
    case 'Cachar':
      return {
        river: 'Barak River',
        riverColor: '#3B82F6',
        riverPath: 'M 0 350 Q 150 320 300 370 T 500 340',
        riverTextX: 180,
        riverTextY: 340,
        roads: [
          { name: 'Hospital Road', x1: 50, y1: 0, x2: 450, y2: 400, textX: 80, textY: 70, rotate: 45 },
          { name: 'Station Road', x1: 0, y1: 200, x2: 500, y2: 200, textX: 20, textY: 192, rotate: 0 },
          { name: 'Circuit House Road', x1: 150, y1: 0, x2: 150, y2: 400, textX: 156, textY: 80, rotate: 90 }
        ],
        landmarks: [
          { name: 'Silchar Railway Station', x: 250, y: 100 },
          { name: 'SM Dev Civil Hospital', x: 120, y: 150 },
          { name: 'Assam University', x: 80, y: 80 },
          { name: 'Silchar Medical College', x: 200, y: 200 },
          { name: 'Goldighi Shopping Mall', x: 300, y: 220 },
          { name: 'District Library Silchar', x: 180, y: 280 }
        ]
      };
    case 'Jorhat':
      return {
        river: 'Bhogdoi River',
        riverColor: '#60A5FA',
        riverPath: 'M 100 0 Q 80 180 120 280 T 90 400',
        riverTextX: 110,
        riverTextY: 40,
        roads: [
          { name: 'KB Road', x1: 0, y1: 100, x2: 500, y2: 300, textX: 300, textY: 210, rotate: 22 },
          { name: 'AT Road', x1: 0, y1: 300, x2: 500, y2: 100, textX: 100, textY: 250, rotate: -22 },
          { name: 'Gar-Ali Road', x1: 0, y1: 220, x2: 500, y2: 220, textX: 20, textY: 212, rotate: 0 }
        ],
        landmarks: [
          { name: 'Jorhat Railway Station', x: 250, y: 100 },
          { name: 'Jorhat Gymkhana Club', x: 120, y: 150 },
          { name: 'Jorhat Medical College', x: 80, y: 80 },
          { name: 'AAU Campus Jorhat', x: 200, y: 200 },
          { name: 'Jorhat Science Centre', x: 300, y: 220 },
          { name: 'Prince of Wales Institute', x: 180, y: 280 }
        ]
      };
    case 'Dibrugarh':
      return {
        river: 'Brahmaputra River',
        riverColor: '#93C5FD',
        riverPath: 'M 0 0 Q 220 120 180 400',
        riverTextX: 80,
        riverTextY: 50,
        roads: [
          { name: 'AT Road', x1: 0, y1: 280, x2: 500, y2: 280, textX: 20, textY: 272, rotate: 0 },
          { name: 'Mankotta Road', x1: 220, y1: 0, x2: 220, y2: 400, textX: 226, textY: 80, rotate: 90 },
          { name: 'Marwari Patty Road', x1: 180, y1: 400, x2: 450, y2: 0, textX: 230, textY: 330, rotate: -56 }
        ],
        landmarks: [
          { name: 'Dibrugarh Town Station', x: 250, y: 100 },
          { name: 'Assam Medical College', x: 120, y: 150 },
          { name: 'Dibrugarh University', x: 80, y: 80 },
          { name: 'Chowkidingee Playground', x: 200, y: 200 },
          { name: 'Junction Mall Dibrugarh', x: 300, y: 220 },
          { name: 'District Court Dibrugarh', x: 180, y: 280 }
        ]
      };
    case 'Sonitpur':
      return {
        river: 'Brahmaputra River',
        riverColor: '#93C5FD',
        riverPath: 'M 250 0 Q 350 150 500 200',
        riverTextX: 340,
        riverTextY: 80,
        roads: [
          { name: 'Cole Road', x1: 0, y1: 100, x2: 500, y2: 100, textX: 20, textY: 92, rotate: 0 },
          { name: 'Tezpur Bypass Road', x1: 400, y1: 0, x2: 400, y2: 400, textX: 406, textY: 80, rotate: 90 },
          { name: 'AT Road', x1: 0, y1: 380, x2: 500, y2: 180, textX: 100, textY: 330, rotate: -22 }
        ],
        landmarks: [
          { name: 'Tezpur Railway Station', x: 250, y: 100 },
          { name: 'Tezpur Medical College', x: 120, y: 150 },
          { name: 'Tezpur University', x: 80, y: 80 },
          { name: 'Agnigarh Hill Park', x: 200, y: 200 },
          { name: 'Cole Park Tezpur', x: 300, y: 220 },
          { name: 'Tezpur District Court', x: 180, y: 280 }
        ]
      };
    default: {
      // Simple hash helper to get deterministic numbers from district name
      const getHash = (str: string, offset: number) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return Math.abs(hash + offset);
      };

      // Generate unique river shape based on hash
      const rY1 = 30 + (getHash(dist, 1) % 60); // 30-90
      const rY2 = 30 + (getHash(dist, 2) % 60); // 30-90
      const rPath = `M 0 ${rY1} Q 150 ${rY1 - 20} 280 ${rY2 + 20} T 500 ${rY2}`;
      
      // Generate unique road lines based on hash
      const road1Y = 120 + (getHash(dist, 3) % 80); // 120-200 (horizontal road)
      const road2X = 220 + (getHash(dist, 4) % 120); // 220-340 (vertical road)
      
      const diagStart = 50 + (getHash(dist, 5) % 80); // 50-130
      const diagEnd = 200 + (getHash(dist, 6) % 100); // 200-300
      
      return {
        river: dist === 'Kamrup Metropolitan' ? 'Brahmaputra River' : `${dist} River/Canal`,
        riverColor: '#93C5FD',
        riverPath: dist === 'Kamrup Metropolitan' ? 'M 0 40 Q 150 20 280 50 T 500 30' : rPath,
        riverTextX: 180,
        riverTextY: dist === 'Kamrup Metropolitan' ? 32 : rY1 - 8,
        roads: [
          { 
            name: dist === 'Kamrup Metropolitan' ? 'R.G. Baruah Road' : `${dist} Main Road`, 
            x1: 0, y1: dist === 'Kamrup Metropolitan' ? 150 : road1Y, 
            x2: 500, y2: dist === 'Kamrup Metropolitan' ? 150 : road1Y, 
            textX: 20, textY: dist === 'Kamrup Metropolitan' ? 142 : road1Y - 8, 
            rotate: 0 
          },
          { 
            name: dist === 'Kamrup Metropolitan' ? 'G.S. Road' : `${dist} Bypass Road`, 
            x1: dist === 'Kamrup Metropolitan' ? 300 : road2X, y1: 0, 
            x2: dist === 'Kamrup Metropolitan' ? 300 : road2X, y2: 400, 
            textX: dist === 'Kamrup Metropolitan' ? 306 : road2X + 6, textY: 80, 
            rotate: 90 
          },
          { 
            name: dist === 'Kamrup Metropolitan' ? 'Zoo Road' : `${dist} Link Road`, 
            x1: dist === 'Kamrup Metropolitan' ? 100 : diagStart, y1: 350, 
            x2: dist === 'Kamrup Metropolitan' ? 250 : diagEnd, y2: 50, 
            textX: dist === 'Kamrup Metropolitan' ? 110 : diagStart + 10, textY: dist === 'Kamrup Metropolitan' ? 270 : 250, 
            rotate: dist === 'Kamrup Metropolitan' ? -63 : -55 
          }
        ],
        landmarks: [
          { name: dist === 'Kamrup Metropolitan' ? 'ABC School' : `${dist} School`, x: 120, y: 150 },
          { name: dist === 'Kamrup Metropolitan' ? 'ABC Market' : `${dist} Market`, x: 300, y: 220 },
          { name: dist === 'Kamrup Metropolitan' ? 'Guwahati High Court' : `${dist} High Court`, x: 80, y: 80 },
          { name: dist === 'Kamrup Metropolitan' ? 'Guwahati Railway Station' : `${dist} Railway Station`, x: 250, y: 100 },
          { name: dist === 'Kamrup Metropolitan' ? 'State Zoo' : `${dist} Civil Hospital`, x: 200, y: 200 },
          { name: dist === 'Kamrup Metropolitan' ? 'Guwahati Public School' : `${dist} District Court`, x: 180, y: 280 }
        ]
      };
    }
  }
};

const getStateForDistrict = (dist: string): string => {
  for (const [state, districts] of Object.entries(STATES_AND_DISTRICTS)) {
    if (districts.includes(dist)) {
      return state;
    }
  }
  return 'Assam';
};

const getMockLandmarks = (dist: string): Landmark[] => {
  const mapData = getDistrictMapData(dist);
  const resolvedState = getStateForDistrict(dist);
  return mapData.landmarks.map((l, i) => {
    let address = '';
    if (dist === 'Kamrup Metropolitan') {
      const standardAddresses = [
        'Near ABC School, R.G. Baruah Road, Guwahati, Assam',
        'ABC Market Entrance, G.S. Road, Guwahati, Assam',
        'MG Road, Latasil, Guwahati, Assam',
        'Station Road, Paltan Bazaar, Guwahati, Assam',
        'Zoo Road Main Entrance, Guwahati, Assam',
        'GPS Campus Lane, Zoo Road, Guwahati, Assam'
      ];
      address = standardAddresses[i] || `${l.name}, Guwahati, ${dist}, ${resolvedState}`;
    } else {
      address = `Near ${l.name}, ${mapData.roads[i % mapData.roads.length].name}, ${dist}, ${resolvedState}`;
    }
    return {
      name: l.name,
      x: l.x,
      y: l.y,
      address
    };
  });
};

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  initialLocation,
  onLocationSelect,
  district,
  language
}) => {
  const [selectedDistrict, setSelectedDistrict] = useState(district);
  const [locType, setLocType] = useState<'current' | 'search' | 'map' | 'manual'>(
    initialLocation?.type || 'current'
  );
  const [address, setAddress] = useState(initialLocation?.address || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Landmark[]>([]);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [loadingGeo, setLoadingGeo] = useState(false);

  useEffect(() => {
    setSelectedDistrict(district);
  }, [district]);

  const activeLandmarks = getMockLandmarks(selectedDistrict);
  const districtMapData = getDistrictMapData(selectedDistrict);

  // Map coordinates (percentages 0-100 on canvas)
  const [markerPos, setMarkerPos] = useState({ x: 50, y: 50 });
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);

  const updateMarkerFromEvent = (clientX: number, clientY: number) => {
    if (!mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));

    setMarkerPos({ x, y });
    findNearestAddress(x, y);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updateMarkerFromEvent(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateMarkerFromEvent(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches && e.touches[0]) {
      setIsDragging(true);
      updateMarkerFromEvent(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    if (e.touches && e.touches[0]) {
      updateMarkerFromEvent(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Add global mouse up listener to handle mouse release outside map container
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, []);

  useEffect(() => {
    if (initialLocation) {
      setAddress(initialLocation.address);
      if (initialLocation.coordinates) {
        // Mock translate lat/lng (near Guwahati coordinates) to canvas 0-100
        // lat is 26.15-26.18, lng is 91.75-91.79
        const lat = initialLocation.coordinates.lat;
        const lng = initialLocation.coordinates.lng;
        const x = Math.max(10, Math.min(90, ((lng - 91.75) / 0.04) * 100));
        const y = Math.max(10, Math.min(90, (1 - (lat - 26.15) / 0.03) * 100));
        setMarkerPos({ x, y });
      }
    }
  }, [initialLocation]);

  // Request browser geolocation
  const handleUseCurrentLocation = () => {
    setLoadingGeo(true);
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      setLoadingGeo(false);
      setLocType('manual');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const resolvedState = getStateForDistrict(selectedDistrict);
        const mockAddress = language === 'hi'
          ? `वार्ड नंबर 7, स्थानीय बाजार के पास, ${selectedDistrict}, ${resolvedState} (वर्तमान निर्देशांक: ${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
          : `Ward No. 7, near Local Market, ${selectedDistrict}, ${resolvedState} (Current Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
        setAddress(mockAddress);
        setMarkerPos({ x: 45, y: 55 }); // Pick a center spot on mock map
        setLoadingGeo(false);
        onLocationSelect({
          type: 'current',
          address: mockAddress,
          district: selectedDistrict,
          coordinates: { lat: latitude, lng: longitude }
        });
      },
      (error) => {
        console.warn("Geolocation permission denied:", error);
        setGeoError("Location access isn't available. Please search or enter address manually.");
        setLoadingGeo(false);
        setLocType('manual');
      },
      { timeout: 5000 }
    );
  };

  // Mock Geolocation on page load if type is current
  useEffect(() => {
    if (locType === 'current' && !address) {
      handleUseCurrentLocation();
    }
  }, [locType]);

  // Search Landmarks
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.toLowerCase();
    const matches = activeLandmarks.filter(
      l => l.name.toLowerCase().includes(query) || l.address.toLowerCase().includes(query)
    );

    setSearchResults(matches);
  };

  const handleSelectSearchResult = (landmark: Landmark) => {
    // Translate coord coordinates
    setMarkerPos({ x: (landmark.x / 400) * 100, y: (landmark.y / 400) * 100 });
    setAddress(landmark.address);
    setSearchQuery('');
    setSearchResults([]);
    onLocationSelect({
      type: 'search',
      address: landmark.address,
      district: selectedDistrict,
      coordinates: { 
        lat: 26.15 + (1 - landmark.y / 400) * 0.03, 
        lng: 91.75 + (landmark.x / 400) * 0.04 
      }
    });
  };



  // Calculate nearest address on mock map coordinate click
  const findNearestAddress = (pctX: number, pctY: number) => {
    const canvasX = (pctX / 100) * 400;
    const canvasY = (pctY / 100) * 400;

    let closest: Landmark = activeLandmarks[0];
    let minDist = Infinity;

    activeLandmarks.forEach(l => {
      const dist = Math.sqrt(Math.pow(l.x - canvasX, 2) + Math.pow(l.y - canvasY, 2));
      if (dist < minDist) {
        minDist = dist;
        closest = l;
      }
    });

    let calculatedAddress = '';
    const resolvedState = getStateForDistrict(selectedDistrict);
    if (minDist < 60) {
      // Very close to a landmark
      calculatedAddress = closest.address;
    } else {
      // General coordinate address
      calculatedAddress = language === 'hi'
        ? `निर्देशांक (${pctX.toFixed(0)}, ${pctY.toFixed(0)}) के पास स्ट्रीट ब्लॉक, ${districtMapData.roads[2].name}, ${selectedDistrict}, ${resolvedState}`
        : `Street block near coordinates (${pctX.toFixed(0)}, ${pctY.toFixed(0)}), ${districtMapData.roads[2].name}, ${selectedDistrict}, ${resolvedState}`;
    }

    setAddress(calculatedAddress);
    onLocationSelect({
      type: 'map',
      address: calculatedAddress,
      district: selectedDistrict,
      coordinates: { 
        lat: 26.15 + (1 - pctY / 100) * 0.03, 
        lng: 91.75 + (pctX / 100) * 0.04 
      }
    });
  };

  const handleManualSubmit = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setAddress(val);
    onLocationSelect({
      type: 'manual',
      address: val,
      district: selectedDistrict
    });
  };

  return (
    <div style={{ marginTop: '0.5rem' }}>
      {/* Selection Tabs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.4rem',
        marginBottom: '1rem'
      }}>
        {[
          { type: 'current', label: language === 'hi' ? 'जीपीएस स्थान' : 'GPS Loc', icon: Navigation },
          { type: 'search', label: language === 'hi' ? 'खोजें' : 'Search', icon: Search },
          { type: 'map', label: language === 'hi' ? 'नक्शा पिन' : 'Map Pin', icon: MapPin },
          { type: 'manual', label: language === 'hi' ? 'मैन्युअल' : 'Manual', icon: MapPin }
        ].map(item => (
          <Parallelogram
            key={item.type}
            onClick={() => setLocType(item.type as any)}
            style={{
              background: locType === item.type ? 'var(--color-primary-light)' : '#FFFFFF',
              border: locType === item.type ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
              cursor: 'pointer',
              padding: '0.6rem 0.2rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.2rem'
            }}
          >
            <item.icon size={16} style={{ color: locType === item.type ? 'var(--color-primary)' : 'var(--color-text-muted)' }} />
            <span style={{ 
              fontSize: '0.7rem', 
              fontWeight: locType === item.type ? 700 : 500,
              color: locType === item.type ? 'var(--color-primary)' : 'var(--color-text-muted)'
            }}>
              {item.label}
            </span>
          </Parallelogram>
        ))}
      </div>

      {/* Content based on selected locType */}
      <div style={{ 
        backgroundColor: '#FFFFFF', 
        border: '1px solid var(--color-border)', 
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1rem'
      }}>
        {locType === 'current' && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            {loadingGeo ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                <span className="spinner" style={{ display: 'inline-block', marginRight: '0.5rem', animation: 'spin 1s linear infinite' }}>⏳</span>
                {language === 'hi' ? 'डिवाइस जीपीएस तक पहुंच रहे हैं...' : 'Accessing device GPS...'}
              </div>
            ) : geoError ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={32} style={{ color: 'var(--color-attention-text)' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--color-attention-text)', fontWeight: 550, textAlign: 'center' }}>
                  {geoError}
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-resolved-text)', fontWeight: 600, fontSize: '0.9rem' }}>
                  <Check size={20} />
                  {language === 'hi' ? 'जीपीएस कोऑर्डिनेट्स लॉक किए गए' : 'GPS Coordinates Locked'}
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', maxWidth: '300px', margin: '0 auto' }}>
                  {address}
                </p>
                <button 
                  type="button" 
                  onClick={handleUseCurrentLocation}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary)',
                    fontSize: '0.75rem',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    marginTop: '0.5rem'
                  }}
                >
                  {language === 'hi' ? 'स्थान रीफ्रेश करें' : 'Refresh location'}
                </button>
              </div>
            )}
          </div>
        )}

        {locType === 'search' && (
          <div>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem' }}>
              <div className="form-input-wrapper" style={{ flex: 1, borderRadius: '6px', padding: '0.4rem 0.8rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder={language === 'hi' ? 'मील का पत्थर, सड़क, या क्षेत्र खोजें...' : 'Search landmark, street, or area...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button 
                type="submit" 
                className="btn-primary" 
                style={{ borderRadius: '6px', padding: '0.4rem 1rem', fontSize: '0.85rem' }}
              >
                <Search size={16} />
              </button>
            </form>

            {searchResults.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  {language === 'hi' ? 'खोज परिणाम' : 'SEARCH RESULTS'}
                </span>
                {searchResults.map(l => (
                  <button
                    key={l.name}
                    type="button"
                    onClick={() => handleSelectSearchResult(l)}
                    style={{
                      background: 'none',
                      border: '1px solid var(--color-border)',
                      borderRadius: '6px',
                      padding: '0.6rem 0.8rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.8rem',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <MapPin size={16} style={{ color: 'var(--color-primary)' }} />
                    <div>
                      <strong style={{ display: 'block', color: 'var(--color-text-main)' }}>{l.name}</strong>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>{l.address}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : searchQuery && (
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', padding: '0.5rem 0' }}>
                {language === 'hi'
                  ? 'कोई लैंडमार्क नहीं मिला। "ABC Market" या "ABC School" खोजने का प्रयास करें।'
                  : 'No landmarks found. Try searching "ABC Market", "ABC School", or "Zoo Road".'}
              </div>
            )}
          </div>
        )}

        {locType === 'map' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                <span>{selectedDistrict} {language === 'hi' ? 'जिला' : 'District'}</span>
                <select
                  value={selectedDistrict}
                  onChange={(e) => {
                    const newDist = e.target.value;
                    const resolvedState = getStateForDistrict(newDist);
                    setSelectedDistrict(newDist);
                    // Update address with new district if it is coordinate based
                    let updatedAddress = address;
                    if (address.includes('coordinates') || address.includes('निर्देशांक')) {
                      updatedAddress = language === 'hi'
                        ? `निर्देशांक (${markerPos.x.toFixed(0)}, ${markerPos.y.toFixed(0)}) के पास स्ट्रीट ब्लॉक, ${districtMapData.roads[2].name}, ${newDist}, ${resolvedState}`
                        : `Street block near coordinates (${markerPos.x.toFixed(0)}, ${markerPos.y.toFixed(0)}), ${districtMapData.roads[2].name}, ${newDist}, ${resolvedState}`;
                      setAddress(updatedAddress);
                    }
                    onLocationSelect({
                      type: 'map',
                      address: updatedAddress,
                      district: newDist,
                      coordinates: {
                        lat: 26.15 + (1 - markerPos.y / 100) * 0.03,
                        lng: 91.75 + (markerPos.x / 100) * 0.04
                      }
                    });
                  }}
                  style={{
                    backgroundColor: 'rgba(95, 62, 43, 0.1)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '4px',
                    padding: '0.1rem 0.3rem',
                    fontSize: '0.7rem',
                    color: 'var(--color-primary)',
                    fontWeight: 600,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {(STATES_AND_DISTRICTS[getStateForDistrict(district)] || STATES_AND_DISTRICTS['Assam']).map(d => (
                    <option key={d} value={d} style={{ color: '#000000' }}>{d}</option>
                  ))}
                </select>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                {language === 'hi' ? 'मार्कर लगाने के लिए मानचित्र पर क्लिक करें' : 'CLICK ON MAP TO PLACE MARKER'}
              </span>
            </div>

            {/* SVG Interactive Mock Map Canvas */}
            <div 
              ref={mapContainerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{
                width: '100%',
                height: '200px',
                position: 'relative',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                backgroundColor: '#FAF5F0',
                cursor: 'crosshair',
                overflow: 'hidden',
                userSelect: 'none'
              }}
            >
              {/* Grid backdrop */}
              <svg width="100%" height="100%">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(95, 62, 43, 0.05)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* River */}
                <path 
                  d={districtMapData.riverPath} 
                  fill="none" 
                  stroke={districtMapData.riverColor} 
                  strokeWidth="20" 
                  opacity="0.25"
                  strokeLinecap="round"
                />
                <text x={districtMapData.riverTextX} y={districtMapData.riverTextY} fill="var(--color-primary)" fontSize="8" fontWeight="bold" opacity="0.6" fontStyle="italic">
                  {districtMapData.river}
                </text>

                {/* Roads */}
                {districtMapData.roads.map(r => (
                  <g key={r.name}>
                    <line x1={`${r.x1}%`} y1={`${r.y1}%`} x2={`${r.x2}%`} y2={`${r.y2}%`} stroke="rgba(95, 62, 43, 0.15)" strokeWidth="12" strokeLinecap="round" />
                    <line x1={`${r.x1}%`} y1={`${r.y1}%`} x2={`${r.x2}%`} y2={`${r.y2}%`} stroke="#FFFFFF" strokeWidth="2" strokeDasharray="5,5" strokeLinecap="round" />
                    <text 
                      x={`${r.textX}%`} 
                      y={`${r.textY}%`} 
                      fill="var(--color-text-muted)" 
                      fontSize="7" 
                      fontWeight="bold" 
                      transform={`rotate(${r.rotate}, ${r.textX}%, ${r.textY}%)`}
                      opacity="0.8"
                    >
                      {r.name}
                    </text>
                  </g>
                ))}

                {/* Landmarks */}
                {activeLandmarks.map(l => (
                  <g key={l.name}>
                    <circle cx={l.x} cy={l.y} r="2" fill="var(--color-primary)" />
                    <text x={l.x + 6} y={l.y + 3} fill="var(--color-primary)" fontSize="7" fontWeight="bold" opacity="0.7">
                      {l.name}
                    </text>
                  </g>
                ))}
              </svg>

              {/* Draggable marker pinning */}
              <div style={{
                position: 'absolute',
                left: `${markerPos.x}%`,
                top: `${markerPos.y}%`,
                transform: 'translate(-50%, -100%)',
                pointerEvents: 'none',
                transition: 'left 0.2s, top 0.2s'
              }}>
                <MapPin size={32} style={{ color: '#EF4444', fill: 'rgba(239, 68, 68, 0.2)' }} />
              </div>
            </div>
            
            {/* Show mapped address */}
            {address && (
              <div style={{ 
                marginTop: '0.8rem', 
                backgroundColor: '#F8FAFC', 
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                padding: '0.6rem',
                fontSize: '0.8rem',
                color: 'var(--color-text-main)'
              }}>
                <strong>{language === 'hi' ? 'पिन किया गया पता:' : 'Pinned Address:'}</strong> {address}
              </div>
            )}
          </div>
        )}

        {locType === 'manual' && (
          <div>
            <label className="form-label">{language === 'hi' ? 'स्थान का विवरण मैन्युअल रूप से दर्ज करें' : 'ENTER DETAILS MANUALLY'}</label>
            <textarea
              className="form-input"
              rows={3}
              style={{
                border: '1.5px solid var(--color-border)',
                borderRadius: '6px',
                padding: '0.5rem',
                backgroundColor: '#FFFFFF',
                color: '#5F3E2B',
                resize: 'none',
                width: '100%'
              }}
              placeholder={language === 'hi' ? 'उदा. मकान नंबर 42 के पास, गली 2, जू-रोड तिनियाली, गुवाहाटी' : 'e.g. Near House No 42, Lane 2, Zoo-Road Tiniali, Guwahati'}
              value={address}
              onChange={handleManualSubmit}
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
