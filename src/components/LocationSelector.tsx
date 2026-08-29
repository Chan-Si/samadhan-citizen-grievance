import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Navigation, AlertTriangle, Check } from 'lucide-react';
import type { LocationData, Language, Complaint } from '../types';
import { Parallelogram } from './Parallelogram';
import { STATES_AND_DISTRICTS } from '../statesAndDistricts';
import { INITIAL_COMPLAINTS } from '../mockData';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface LocationSelectorProps {
  initialLocation?: LocationData;
  onLocationSelect: (location: LocationData) => void;
  district: string;
  language: Language;
}

const getDistrictCoordinates = (dist: string): [number, number] => {
  switch (dist) {
    case 'Bangalore Urban':
    case 'Bengaluru Urban': return [77.5946, 12.9716];
    case 'Kamrup Metropolitan': return [91.7761, 26.1754];
    case 'Jorhat': return [94.2026, 26.7509];
    case 'Dibrugarh': return [94.9120, 27.4728];
    case 'Sonitpur': return [92.7926, 26.6528];
    case 'Cachar': return [92.7989, 24.8333];
    default: {
      let hash = 0;
      for (let i = 0; i < dist.length; i++) {
        hash = dist.charCodeAt(i) + ((hash << 5) - hash);
      }
      const lat = 25.5 + (Math.abs(hash % 100) / 100) * 2.0;
      const lng = 90.5 + (Math.abs((hash >> 5) % 100) / 100) * 4.0;
      return [lng, lat];
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

const getFallbackAddress = (lat: number, lng: number, districtName: string, language: Language) => {
  const resolvedState = getStateForDistrict(districtName);
  return language === 'hi'
    ? `निर्देशांक (${lat.toFixed(4)}, ${lng.toFixed(4)}) के पास स्ट्रीट ब्लॉक, ${districtName}, ${resolvedState}`
    : `Street block near coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)}), ${districtName}, ${resolvedState}`;
};

const getClusters = (complaints: Complaint[], zoom: number) => {
  const clusters: any[] = [];
  const radius = zoom > 14 ? 0.001 : zoom > 12 ? 0.005 : 0.015;
  
  complaints.forEach(c => {
    if (!c.location?.coordinates) return;
    const { lat, lng } = c.location.coordinates;
    
    let added = false;
    for (let i = 0; i < clusters.length; i++) {
      const cluster = clusters[i];
      const dist = Math.sqrt(Math.pow(cluster.lat - lat, 2) + Math.pow(cluster.lng - lng, 2));
      if (dist < radius) {
        cluster.points.push(c);
        cluster.lat = (cluster.lat * (cluster.points.length - 1) + lat) / cluster.points.length;
        cluster.lng = (cluster.lng * (cluster.points.length - 1) + lng) / cluster.points.length;
        added = true;
        break;
      }
    }
    if (!added) {
      clusters.push({
        lat,
        lng,
        points: [c]
      });
    }
  });
  return clusters;
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
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [searching, setSearching] = useState(false);

  const [allComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem('samadhan_complaints');
    const list: Complaint[] = saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
    const center = getDistrictCoordinates(selectedDistrict);
    return list.map((c: any) => {
      if (!c.location?.coordinates) {
        let hash = 0;
        for (let i = 0; i < (c.id || '').length; i++) {
          hash = (c.id || '').charCodeAt(i) + ((hash << 5) - hash);
        }
        const latOffset = ((hash % 100) / 100 - 0.5) * 0.04;
        const lngOffset = (((hash >> 4) % 100) / 100 - 0.5) * 0.04;
        c.location = {
          ...c.location,
          coordinates: {
            lat: center[1] + latOffset,
            lng: center[0] + lngOffset
          }
        };
      }
      return c;
    });
  });

  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number }>(() => {
    if (initialLocation?.coordinates) {
      return { lat: initialLocation.coordinates.lat, lng: initialLocation.coordinates.lng };
    }
    const center = getDistrictCoordinates(district);
    return { lat: center[1], lng: center[0] };
  });

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const otherMarkersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    setSelectedDistrict(district);
  }, [district]);

  // Initializing Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const center = getDistrictCoordinates(selectedDistrict);
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'raster-tiles': {
            type: 'raster',
            tiles: [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'simple-tiles',
            type: 'raster',
            source: 'raster-tiles',
            minzoom: 0,
            maxzoom: 20
          }
        ]
      },
      center: [center[0], center[1]],
      zoom: 12
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;

    const updateZoomMarkers = () => {
      const zoom = map.getZoom();
      plotComplaintMarkers(map, zoom);
    };

    map.on('zoom', updateZoomMarkers);
    map.on('moveend', updateZoomMarkers);
    map.on('load', updateZoomMarkers);

    // Click map to select location manually
    map.on('click', async (e: any) => {
      if (mapRef.current) {
        const { lng, lat } = e.lngLat;
        setMarkerPos({ lat, lng });
        setLocType('map');

        // Reverse Geocode
        const realAddress = await fetchReverseGeocode(lat, lng);
        const resolvedAddress = realAddress || getFallbackAddress(lat, lng, selectedDistrict, language);
        setAddress(resolvedAddress);
        onLocationSelect({
          type: 'map',
          address: resolvedAddress,
          district: selectedDistrict,
          coordinates: { lat, lng }
        });
      }
    });

    return () => {
      otherMarkersRef.current.forEach(m => m.remove());
      if (userMarkerRef.current) userMarkerRef.current.remove();
      map.remove();
    };
  }, []);

  // Resize map when switched to map view
  useEffect(() => {
    if (locType === 'map' && mapRef.current) {
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.resize();
        }
      }, 50);
    }
  }, [locType]);

  // Update user selection marker position on map when state changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (locType === 'map' && markerPos) {
      if (!userMarkerRef.current) {
        const el = document.createElement('div');
        el.className = 'user-map-pin';
        el.style.width = '32px';
        el.style.height = '32px';
        el.style.cursor = 'grab';
        el.innerHTML = `
          <svg viewBox="0 0 24 24" width="32" height="32" fill="#EF4444" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3" fill="#FFFFFF"></circle>
          </svg>
        `;

        const marker = new maplibregl.Marker({ element: el, draggable: true })
          .setLngLat([markerPos.lng, markerPos.lat])
          .addTo(map);

        marker.on('dragend', async () => {
          const lngLat = marker.getLngLat();
          setMarkerPos({ lat: lngLat.lat, lng: lngLat.lng });

          // Reverse Geocode
          const realAddress = await fetchReverseGeocode(lngLat.lat, lngLat.lng);
          const resolvedAddress = realAddress || getFallbackAddress(lngLat.lat, lngLat.lng, selectedDistrict, language);
          setAddress(resolvedAddress);
          onLocationSelect({
            type: 'map',
            address: resolvedAddress,
            district: selectedDistrict,
            coordinates: { lat: lngLat.lat, lng: lngLat.lng }
          });
        });

        userMarkerRef.current = marker;
      } else {
        userMarkerRef.current.setLngLat([markerPos.lng, markerPos.lat]);
      }
    } else {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
    }
  }, [locType, markerPos]);

  // Center map on district select
  useEffect(() => {
    if (mapRef.current) {
      const center = getDistrictCoordinates(selectedDistrict);
      mapRef.current.flyTo({ center: [center[0], center[1]], zoom: 12 });
      setMarkerPos({ lat: center[1], lng: center[0] });
    }
  }, [selectedDistrict]);

  // Track initial location selection updates
  useEffect(() => {
    if (initialLocation && initialLocation.coordinates) {
      setMarkerPos({
        lat: initialLocation.coordinates.lat,
        lng: initialLocation.coordinates.lng
      });
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [initialLocation.coordinates.lng, initialLocation.coordinates.lat],
          zoom: 13
        });
      }
    }
  }, [initialLocation]);

  // Plot complaints and clusters on the map
  const plotComplaintMarkers = (map: maplibregl.Map, zoom: number) => {
    // Clear old markers
    otherMarkersRef.current.forEach(m => m.remove());
    otherMarkersRef.current = [];

    // Filter complaints matching this district
    const districtComplaints = allComplaints.filter(
      c => c.location?.district === selectedDistrict
    );

    const clusters = getClusters(districtComplaints, zoom);

    clusters.forEach(cluster => {
      const el = document.createElement('div');
      
      if (cluster.points.length > 1) {
        // Cluster marker
        el.className = 'map-cluster-marker';
        el.style.width = '36px';
        el.style.height = '36px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = '#5F3E2B';
        el.style.color = '#FFFFFF';
        el.style.border = '2.5px solid #FFFFFF';
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.fontWeight = 'bold';
        el.style.fontSize = '0.85rem';
        el.style.cursor = 'pointer';
        el.innerText = cluster.points.length.toString();

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([cluster.lng, cluster.lat])
          .addTo(map);

        el.addEventListener('click', () => {
          map.flyTo({
            center: [cluster.lng, cluster.lat],
            zoom: map.getZoom() + 2
          });
        });

        otherMarkersRef.current.push(marker);
      } else {
        // Individual marker
        const comp = cluster.points[0];
        el.className = 'map-complaint-marker';
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.borderRadius = '50%';

        let color = '#EAB308'; // Yellow: Under Review
        if (comp.status === 'Resolved') {
          color = '#22C55E'; // Green: Resolved
        } else if (comp.status === 'Needs Attention' || (comp.severity && comp.severity.toLowerCase().includes('safety'))) {
          color = '#EF4444'; // Red: Urgent / High reports
        }

        el.style.backgroundColor = color;
        el.style.border = '2.5px solid #FFFFFF';
        el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
        el.style.cursor = 'pointer';

        // Styled Popup Content Card matching design
        const popupDiv = document.createElement('div');
        popupDiv.style.fontFamily = 'Poppins, sans-serif';
        popupDiv.style.fontSize = '0.8rem';
        popupDiv.style.color = '#333333';
        popupDiv.style.padding = '0.4rem';
        popupDiv.style.maxWidth = '220px';

        popupDiv.innerHTML = `
          <div style="font-weight: 700; color: #5F3E2B; margin-bottom: 0.2rem; font-family: Montserrat, sans-serif; font-size: 0.9rem;">
            ${comp.subcategory || comp.category}
          </div>
          <div style="margin-bottom: 0.2rem; color: #666666;">
            <strong>Location:</strong> ${comp.location?.address.split(',')[0]}
          </div>
          <div style="margin-bottom: 0.2rem; color: #666666;">
            <strong>Reports:</strong> ${comp.affectedCitizenCount || 1} citizens
          </div>
          <div style="margin-bottom: 0.2rem; display: flex; align-items: center; gap: 0.3rem;">
            <strong>Status:</strong> 
            <span style="background-color: ${color}22; color: ${color}; font-weight: 700; padding: 0.1rem 0.3rem; border-radius: 4px; font-size: 0.75rem;">
              ${comp.status}
            </span>
          </div>
          <div style="color: #666666;">
            <strong>Reported:</strong> ${comp.dateSubmitted}
          </div>
        `;

        const popup = new maplibregl.Popup({ offset: 15 }).setDOMContent(popupDiv);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([cluster.lng, cluster.lat])
          .setPopup(popup)
          .addTo(map);

        otherMarkersRef.current.push(marker);
      }
    });
  };

  // Reverse Geocoding via Nominatim API
  const fetchReverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          return data.display_name;
        }
      }
    } catch (err) {
      console.warn("Reverse geocode request failed:", err);
    }
    return null;
  };

  // Browser Geolocation
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
      async (position) => {
        const { latitude, longitude } = position.coords;
        setMarkerPos({ lat: latitude, lng: longitude });

        const realAddress = await fetchReverseGeocode(latitude, longitude);
        const resolvedAddress = realAddress || getFallbackAddress(latitude, longitude, selectedDistrict, language);

        setAddress(resolvedAddress);
        setLoadingGeo(false);

        if (mapRef.current) {
          mapRef.current.flyTo({ center: [longitude, latitude], zoom: 14 });
        }

        onLocationSelect({
          type: 'current',
          address: resolvedAddress,
          district: selectedDistrict,
          coordinates: { lat: latitude, lng: longitude }
        });
      },
      (error) => {
        console.warn("Geolocation permission denied:", error);
        setGeoError("Location access isn't available. Please search or select on the map.");
        setLoadingGeo(false);
        setLocType('manual');
      },
      { timeout: 5000 }
    );
  };

  useEffect(() => {
    if (locType === 'current' && !address) {
      handleUseCurrentLocation();
    }
  }, [locType]);

  // Geocoding Search via Nominatim API
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchResults([]);

    try {
      const query = `${searchQuery}, ${selectedDistrict}, ${getStateForDistrict(selectedDistrict)}`;
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`);
      
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const results = data.map(item => ({
            name: item.name || item.display_name.split(',')[0],
            address: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon)
          }));
          setSearchResults(results);
          setSearching(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Search request failed:", err);
    }

    // Local Fallback search if geocoding yields no results
    const localMatches = [
      { name: 'ABC School', lat: 26.1754, lng: 91.7761, address: 'Near ABC School, R.G. Baruah Road, Guwahati, Assam' },
      { name: 'ABC Market', lat: 26.1534, lng: 91.7820, address: 'ABC Market Entrance, G.S. Road, Guwahati, Assam' },
      { name: 'Guwahati High Court', lat: 26.1950, lng: 91.7450, address: 'MG Road, Latasil, Guwahati, Assam' },
      { name: 'Guwahati Railway Station', lat: 26.1820, lng: 91.7520, address: 'Station Road, Paltan Bazaar, Guwahati, Assam' },
      { name: 'State Zoo', lat: 26.1680, lng: 91.7800, address: 'Zoo Road Main Entrance, Guwahati, Assam' }
    ].filter(
      l => l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setSearchResults(localMatches);
    setSearching(false);
  };

  const handleSelectSearchResult = (landmark: any) => {
    setMarkerPos({ lat: landmark.lat, lng: landmark.lng });
    setAddress(landmark.address);
    setSearchQuery('');
    setSearchResults([]);

    if (mapRef.current) {
      mapRef.current.flyTo({ center: [landmark.lng, landmark.lat], zoom: 14 });
    }

    onLocationSelect({
      type: 'search',
      address: landmark.address,
      district: selectedDistrict,
      coordinates: { lat: landmark.lat, lng: landmark.lng }
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

      {/* Content card */}
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
                disabled={searching}
              >
                {searching ? '...' : <Search size={16} />}
              </button>
            </form>

            {searchResults.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  {language === 'hi' ? 'खोज परिणाम' : 'SEARCH RESULTS'}
                </span>
                {searchResults.map(l => (
                  <button
                    key={l.address}
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
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <strong style={{ display: 'block', color: 'var(--color-text-main)' }}>{l.name}</strong>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>{l.address}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : searchQuery && !searching && (
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', padding: '0.5rem 0' }}>
                {language === 'hi'
                  ? 'कोई स्थान नहीं मिला। स्थान का नाम पुनः जांचें।'
                  : 'No matching location found. Please refine your query.'}
              </div>
            )}
          </div>
        )}

        {/* Map Tab View (Always mounted, display state controlled dynamically) */}
        <div style={{ display: locType === 'map' ? 'block' : 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
              <span>{selectedDistrict} {language === 'hi' ? 'जिला' : 'District'}</span>
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  setSelectedDistrict(e.target.value);
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
              {language === 'hi' ? 'मानचित्र पर स्थान पिन करें' : 'SELECT COMPLAINT LOCATION'}
            </span>
          </div>

          {/* Real Interactive Map Canvas */}
          <div 
            ref={mapContainerRef}
            style={{
              width: '100%',
              height: '250px',
              position: 'relative',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              backgroundColor: '#FAF5F0',
              overflow: 'hidden'
            }}
          />
          
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
              <strong>{language === 'hi' ? 'पिन किया गया पता:' : 'Selected Location:'}</strong> {address}
            </div>
          )}
        </div>

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
        .user-map-pin {
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35));
        }
        .map-cluster-marker:hover {
          transform: scale(1.15) !important;
        }
        .map-complaint-marker:hover {
          transform: scale(1.25) !important;
        }
        .maplibregl-popup-close-button {
          padding: 2px 6px;
          font-size: 1.1rem;
        }
      `}</style>
    </div>
  );
};
