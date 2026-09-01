import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface Church {
  id: string;
  name: string;
  address: string;
  location: { lat: number; lng: number };
  rating?: number;
  totalRatings?: number;
  isOpen?: boolean;
  phone?: string;
  website?: string;
  hours?: string[];
  distance?: number;
}

interface ChurchFinderProps {
  user: User | null;
  onOpenAuth: () => void;
  onNavigateToBaptism: () => void;
}

const denominations = [
  'All Denominations',
  'Baptist',
  'Methodist',
  'Presbyterian',
  'Lutheran',
  'Pentecostal',
  'Catholic',
  'Episcopal',
  'Non-Denominational',
  'Church of Christ',
  'Assembly of God',
  'Seventh-day Adventist'
];

const ChurchFinder: React.FC<ChurchFinderProps> = ({ user, onOpenAuth, onNavigateToBaptism }) => {
  const [location, setLocation] = useState('');
  const [selectedDenomination, setSelectedDenomination] = useState('All Denominations');
  const [churches, setChurches] = useState<Church[]>([]);
  const [filteredChurches, setFilteredChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedLocation, setSearchedLocation] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [showBaptismModal, setShowBaptismModal] = useState(false);
  const [baptismRequest, setBaptismRequest] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [baptismSubmitted, setBaptismSubmitted] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState<string | null>(null);
  const [apiUnavailable, setApiUnavailable] = useState(false);
  const [mapsLink, setMapsLink] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Get user's current location on mount
  useEffect(() => {
    getUserLocation();
  }, []);

  // Filter churches by denomination
  useEffect(() => {
    if (selectedDenomination === 'All Denominations') {
      setFilteredChurches(churches);
    } else {
      const filtered = churches.filter(church => 
        church.name.toLowerCase().includes(selectedDenomination.toLowerCase())
      );
      setFilteredChurches(filtered.length > 0 ? filtered : churches);
    }
  }, [churches, selectedDenomination]);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setGettingLocation(false);
        console.log('Got user location:', latitude, longitude);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setGettingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access denied. Please enable location services or enter your city/zip code manually.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable. Please enter your city/zip code manually.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out. Please enter your city/zip code manually.');
            break;
          default:
            setLocationError('Unable to get your location. Please enter your city/zip code manually.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // Cache location for 5 minutes
      }
    );
  };

  const searchChurches = async () => {
    // Allow search with just userLocation (no text input needed)
    if (!location.trim() && !userLocation) {
      setError('Please enter a city or zip code, or enable location services');
      return;
    }

    setLoading(true);
    setError(null);
    setChurches([]);
    setSelectedChurch(null);
    setApiUnavailable(false);
    setMapsLink(null);

    try {
      const requestBody: any = { action: 'searchChurches' };
      
      // Always include user's exact coordinates if available for accurate distance calculation
      if (userLocation) {
        requestBody.userLat = userLocation.lat;
        requestBody.userLng = userLocation.lng;
        console.log('Sending user coordinates:', userLocation.lat, userLocation.lng);
      }
      
      // Include location text if provided
      if (location.trim()) {
        requestBody.location = location.trim();
      }

      console.log('Search request:', requestBody);

      const { data, error: fnError } = await supabase.functions.invoke('church-finder', {
        body: requestBody
      });

      console.log('Search response:', data);

      if (fnError) {
        console.error('Function error:', fnError);
        // Silently use Google Maps fallback
        setApiUnavailable(true);
        setMapsLink(`https://www.google.com/maps/search/churches+near+${encodeURIComponent(location.trim() || 'me')}`);
        setSearchedLocation(location.trim() || 'your location');
        // Auto-open in background
        window.open(`https://www.google.com/maps/search/churches+near+${encodeURIComponent(location.trim() || 'me')}`, '_blank');
        return;
      }

      // Check if API is unavailable and we have a fallback
      if (data?.apiUnavailable) {
        setApiUnavailable(true);
        setMapsLink(data.mapsLink || `https://www.google.com/maps/search/churches+near+${encodeURIComponent(location.trim() || 'me')}`);
        setSearchedLocation(data.formattedAddress || location || 'your location');
        if (data.coordinates) {
          setCoordinates(data.coordinates);
        }
        // Auto-open in background
        window.open(data.mapsLink || `https://www.google.com/maps/search/churches+near+${encodeURIComponent(location.trim() || 'me')}`, '_blank');
        return;
      }

      if (data?.error && !data?.churches?.length) {
        // Check if there's a maps link fallback
        if (data.mapsLink) {
          setApiUnavailable(true);
          setMapsLink(data.mapsLink);
          setSearchedLocation(data.formattedAddress || location || 'your location');
          // Auto-open in background
          window.open(data.mapsLink, '_blank');
        } else {
          setError(data.error);
        }
        return;
      }

      // Churches should already be sorted by distance from the backend
      setChurches(data?.churches || []);
      setSearchedLocation(data?.formattedAddress || location || 'your location');
      setCoordinates(data?.coordinates || null);
    } catch (err: any) {
      console.error('Search error:', err);
      // Silently use Google Maps fallback
      setApiUnavailable(true);
      setMapsLink(`https://www.google.com/maps/search/churches+near+${encodeURIComponent(location.trim() || 'me')}`);
      setSearchedLocation(location.trim() || 'your location');
      // Auto-open in background
      window.open(`https://www.google.com/maps/search/churches+near+${encodeURIComponent(location.trim() || 'me')}`, '_blank');
    } finally {
      setLoading(false);
    }
  };


  const searchNearMe = async () => {
    if (!userLocation) {
      getUserLocation();
      return;
    }

    setLocation('');
    setLoading(true);
    setError(null);
    setChurches([]);
    setSelectedChurch(null);
    setApiUnavailable(false);
    setMapsLink(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('church-finder', {
        body: { 
          action: 'searchChurches',
          userLat: userLocation.lat,
          userLng: userLocation.lng
        }
      });

      if (fnError) {
        console.error('Function error:', fnError);
        setApiUnavailable(true);
        setMapsLink('https://www.google.com/maps/search/churches+near+me');
        setSearchedLocation('your location');
        window.open('https://www.google.com/maps/search/churches+near+me', '_blank');
        return;
      }

      if (data?.apiUnavailable) {
        setApiUnavailable(true);
        setMapsLink(data.mapsLink || 'https://www.google.com/maps/search/churches+near+me');
        setSearchedLocation(data.formattedAddress || 'your location');
        if (data.coordinates) {
          setCoordinates(data.coordinates);
        }
        window.open(data.mapsLink || 'https://www.google.com/maps/search/churches+near+me', '_blank');
        return;
      }

      if (data?.error && !data?.churches?.length) {
        if (data.mapsLink) {
          setApiUnavailable(true);
          setMapsLink(data.mapsLink);
          setSearchedLocation(data.formattedAddress || 'your location');
          window.open(data.mapsLink, '_blank');
        } else {
          setError(data.error);
        }
        return;
      }

      setChurches(data?.churches || []);
      setSearchedLocation(data?.formattedAddress || 'your location');
      setCoordinates(data?.coordinates || null);
    } catch (err: any) {
      console.error('Search error:', err);
      setApiUnavailable(true);
      setMapsLink('https://www.google.com/maps/search/churches+near+me');
      setSearchedLocation('your location');
      window.open('https://www.google.com/maps/search/churches+near+me', '_blank');
    } finally {
      setLoading(false);
    }
  };


  const getChurchDetails = async (church: Church) => {
    setLoadingDetails(church.id);
    
    try {
      const requestBody: any = { action: 'getChurchDetails', placeId: church.id };
      
      // Include user coordinates for distance calculation
      if (userLocation) {
        requestBody.userLat = userLocation.lat;
        requestBody.userLng = userLocation.lng;
      }

      const { data, error: fnError } = await supabase.functions.invoke('church-finder', {
        body: requestBody
      });

      if (fnError) throw fnError;

      if (data.error) {
        console.error(data.error);
        setSelectedChurch(church);
        return;
      }

      // Preserve the distance from the original church if not returned
      const churchWithDistance = {
        ...data.church,
        distance: data.church.distance ?? church.distance
      };
      setSelectedChurch(churchWithDistance);
    } catch (err) {
      console.error('Error getting church details:', err);
      setSelectedChurch(church);
    } finally {
      setLoadingDetails(null);
    }
  };

  const handleBaptismRequest = (church: Church) => {
    setSelectedChurch(church);
    setShowBaptismModal(true);
    setBaptismSubmitted(false);
    setBaptismRequest({
      name: '',
      email: '',
      phone: '',
      message: ''
    });
  };

  const submitBaptismRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would send an email or store the request
    // For now, we'll just show a success message
    setBaptismSubmitted(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchChurches();
    }
  };

  // Hidden function - opens Google Maps without showing UI
  const openGoogleMaps = (church: Church) => {
    const query = encodeURIComponent(`${church.name} ${church.address}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  // Hidden function - opens directions without showing UI
  const openDirections = (church: Church) => {
    const destination = encodeURIComponent(church.address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
  };

  // Format distance for display
  const formatDistance = (distance: number | undefined) => {
    if (distance === undefined || distance === null) return null;
    if (distance < 0.1) return 'Less than 0.1 mi';
    if (distance < 10) return `${distance.toFixed(1)} mi`;
    return `${Math.round(distance)} mi`;
  };

  return (
    <div className="min-h-screen bg-[#3d4a4a] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#c9a227]/20 mb-4">
            <svg className="w-8 h-8 text-[#c9a227]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#f5f0e6] mb-4">
            Find a Bible-Believing Church
          </h1>
          <p className="text-lg text-[#f5f0e6]/70 max-w-2xl mx-auto">
            Locate a church in your area where you can grow in faith, fellowship with believers, 
            and take the next step in your <span className="font-bold italic text-[#c9a227]">discipleship</span> journey.
          </p>
        </div>

        {/* Scripture Section - KJV 1611 */}
        <div className="bg-gradient-to-br from-[#1a1510] to-[#2a2520] rounded-2xl p-8 sm:p-10 mb-8 shadow-2xl border border-[#c9a227]/30">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#c9a227]/20 mb-6">
              <svg className="w-6 h-6 text-[#c9a227]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            
            <blockquote className="text-xl sm:text-2xl font-serif text-[#f5f0e6] leading-relaxed mb-6 italic">
              "For where two or three are gathered together in my name, there am I in the midst of them."
            </blockquote>
            <p className="text-[#c9a227] font-semibold text-lg">— Matthew 18:20 (KJV 1611)</p>
            
            <div className="w-24 h-0.5 bg-[#c9a227]/40 mx-auto my-8"></div>
            
            <blockquote className="text-lg sm:text-xl font-serif text-[#f5f0e6]/90 leading-relaxed mb-6 italic">
              "And let us consider one another to provoke unto love and to good works: Not forsaking the assembling of ourselves together, as the manner of some is; but exhorting one another: and so much the more, as ye see the day approaching."
            </blockquote>
            <p className="text-[#c9a227] font-semibold">— Hebrews 10:24-25 (KJV 1611)</p>
            
            <div className="w-24 h-0.5 bg-[#c9a227]/40 mx-auto my-8"></div>
            
            <blockquote className="text-lg sm:text-xl font-serif text-[#f5f0e6]/90 leading-relaxed mb-6 italic">
              "And they continued stedfastly in the apostles' doctrine and fellowship, and in breaking of bread, and in prayers."
            </blockquote>
            <p className="text-[#c9a227] font-semibold">— Acts 2:42 (KJV 1611)</p>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-[#f5f0e6] rounded-2xl p-6 sm:p-8 mb-8 shadow-xl">
          {/* Location Status */}
          {userLocation && (
            <div className="mb-4 flex items-center justify-center text-sm text-[#7c9a7a]">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Location services enabled - churches will be sorted by distance from you</span>
            </div>
          )}
          
          {gettingLocation && (
            <div className="mb-4 flex items-center justify-center text-sm text-[#c9a227]">
              <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Getting your location...</span>
            </div>
          )}

          {locationError && !userLocation && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm text-center">
              {locationError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Location Input */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-[#3d4a4a] mb-2">
                City or Zip Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter city or zip code..."
                  className="w-full px-4 py-3 pl-10 border border-[#3d4a4a]/20 rounded-xl focus:ring-2 focus:ring-[#c9a227] focus:border-transparent transition-all bg-white text-[#3d4a4a]"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3d4a4a]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>

            {/* Denomination Filter */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-[#3d4a4a] mb-2">
                Denomination
              </label>
              <select
                value={selectedDenomination}
                onChange={(e) => setSelectedDenomination(e.target.value)}
                className="w-full px-4 py-3 border border-[#3d4a4a]/20 rounded-xl focus:ring-2 focus:ring-[#c9a227] focus:border-transparent transition-all bg-white text-[#3d4a4a]"
              >
                {denominations.map(denom => (
                  <option key={denom} value={denom}>{denom}</option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <div className="md:col-span-1 flex items-end">
              <button
                onClick={searchChurches}
                disabled={loading}
                className="w-full px-6 py-3 bg-[#c9a227] text-[#1a1510] font-semibold rounded-xl hover:bg-[#b8931f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Find Churches</span>
                  </>
                )}
              </button>
            </div>

            {/* Near Me Button */}
            <div className="md:col-span-1 flex items-end">
              <button
                onClick={searchNearMe}
                disabled={loading || gettingLocation}
                className="w-full px-6 py-3 bg-[#7c9a7a] text-[#f5f0e6] font-semibold rounded-xl hover:bg-[#6b8969] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Near Me</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-xl text-red-700">
              {error}
            </div>
          )}

          {/* Search Results Info */}
          {searchedLocation && !apiUnavailable && (
            <div className="mt-4 text-[#3d4a4a]/70">
              Found <span className="font-semibold text-[#c9a227]">{filteredChurches.length}</span> churches near{' '}
              <span className="font-semibold">{searchedLocation}</span>
              {userLocation && (
                <span className="ml-2 text-sm text-[#7c9a7a]">
                  (sorted by distance from your location)
                </span>
              )}
            </div>
          )}
          
          {/* API Unavailable - Subtle message (no Google Maps button shown) */}
          {apiUnavailable && searchedLocation && (
            <div className="mt-4 p-4 bg-[#c9a227]/10 border border-[#c9a227]/30 rounded-xl">
              <p className="text-[#3d4a4a]">
                Searching for churches near <span className="font-semibold">{searchedLocation}</span>...
              </p>
              <p className="text-[#3d4a4a]/70 text-sm mt-1">
                A new window has opened with church results in your area.
              </p>
            </div>
          )}
        </div>

        {/* Results Section */}
        {filteredChurches.length > 0 && !apiUnavailable && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Church Listings */}
            <div className="space-y-4">
              <h2 className="text-xl font-serif font-bold text-[#f5f0e6] mb-4 flex items-center">
                <span>Churches Near You</span>
                {userLocation && (
                  <span className="ml-3 text-sm font-normal text-[#f5f0e6]/60">
                    (Nearest first)
                  </span>
                )}
              </h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {filteredChurches.map((church, index) => (
                  <div
                    key={church.id}
                    className={`bg-[#f5f0e6] rounded-xl p-5 shadow-lg transition-all cursor-pointer hover:shadow-xl ${
                      selectedChurch?.id === church.id ? 'ring-2 ring-[#c9a227]' : ''
                    }`}
                    onClick={() => getChurchDetails(church)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className="text-lg font-semibold text-[#3d4a4a] mb-1 flex-1">
                            {church.name}
                          </h3>
                          {/* Distance Badge */}
                          {church.distance !== undefined && (
                            <div className="ml-3 flex-shrink-0">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#c9a227]/20 text-[#8b6914]">
                                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                                {formatDistance(church.distance)}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-[#3d4a4a]/70 text-sm mb-2 flex items-start">
                          <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {church.address}
                        </p>
                        
                        {/* Rating */}
                        {church.rating && (
                          <div className="flex items-center space-x-1 mb-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= Math.round(church.rating!) ? 'text-[#c9a227]' : 'text-gray-300'
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-sm text-[#3d4a4a]/60">
                              {church.rating} ({church.totalRatings} reviews)
                            </span>
                          </div>
                        )}

                        {/* Open Status */}
                        {church.isOpen !== undefined && (
                          <span className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                            church.isOpen 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {church.isOpen ? 'Open Now' : 'Closed'}
                          </span>
                        )}
                      </div>

                      {loadingDetails === church.id && (
                        <svg className="animate-spin w-5 h-5 text-[#c9a227]" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      )}
                    </div>

                    {/* Action Buttons - Simplified without visible Google Maps references */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDirections(church);
                        }}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-[#3d4a4a] text-[#f5f0e6] text-sm rounded-lg hover:bg-[#4d5a5a] transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        <span>Get Directions</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBaptismRequest(church);
                        }}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-[#c9a227] text-[#1a1510] text-sm font-medium rounded-lg hover:bg-[#b8931f] transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Request Baptism</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map / Church Details */}
            <div className="lg:sticky lg:top-24">
              {selectedChurch ? (
                <div className="bg-[#f5f0e6] rounded-2xl p-6 shadow-xl">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-xl font-serif font-bold text-[#3d4a4a]">
                      {selectedChurch.name}
                    </h2>
                    {selectedChurch.distance !== undefined && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-[#c9a227]/20 text-[#8b6914]">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {formatDistance(selectedChurch.distance)}
                      </span>
                    )}
                  </div>
                  
                  {/* Address */}
                  <div className="flex items-start space-x-3 mb-4">
                    <svg className="w-5 h-5 text-[#c9a227] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="text-[#3d4a4a] font-medium">Address</p>
                      <p className="text-[#3d4a4a]/70">{selectedChurch.address}</p>
                    </div>
                  </div>

                  {/* Phone */}
                  {selectedChurch.phone && (
                    <div className="flex items-start space-x-3 mb-4">
                      <svg className="w-5 h-5 text-[#c9a227] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <div>
                        <p className="text-[#3d4a4a] font-medium">Phone</p>
                        <a href={`tel:${selectedChurch.phone}`} className="text-[#c9a227] hover:underline">
                          {selectedChurch.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Website */}
                  {selectedChurch.website && (
                    <div className="flex items-start space-x-3 mb-4">
                      <svg className="w-5 h-5 text-[#c9a227] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <div>
                        <p className="text-[#3d4a4a] font-medium">Website</p>
                        <a 
                          href={selectedChurch.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#c9a227] hover:underline break-all"
                        >
                          {selectedChurch.website}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Service Hours */}
                  {selectedChurch.hours && selectedChurch.hours.length > 0 && (
                    <div className="flex items-start space-x-3 mb-4">
                      <svg className="w-5 h-5 text-[#c9a227] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-[#3d4a4a] font-medium mb-2">Service Times</p>
                        <ul className="text-[#3d4a4a]/70 text-sm space-y-1">
                          {selectedChurch.hours.map((hour, index) => (
                            <li key={index}>{hour}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Scripture Quote in Details */}
                  <div className="mt-6 p-4 bg-[#c9a227]/10 rounded-xl border border-[#c9a227]/30">
                    <p className="text-[#3d4a4a] text-sm italic">
                      "I was glad when they said unto me, Let us go into the house of the LORD."
                    </p>
                    <p className="text-[#c9a227] text-sm font-medium mt-2">— Psalm 122:1 (KJV 1611)</p>
                  </div>

                  {/* Request Baptism Button */}
                  <button
                    onClick={() => handleBaptismRequest(selectedChurch)}
                    className="w-full mt-6 px-6 py-3 bg-[#c9a227] text-[#1a1510] font-semibold rounded-xl hover:bg-[#b8931f] transition-colors flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Request Baptism at This Church</span>
                  </button>
                </div>
              ) : (
                <div className="bg-[#f5f0e6] rounded-2xl p-8 shadow-xl text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#c9a227]/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#c9a227]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-[#3d4a4a] mb-2">
                    Select a Church
                  </h3>
                  <p className="text-[#3d4a4a]/70 mb-4">
                    Click on a church from the list to view more details, get directions, or request baptism.
                  </p>
                  <div className="p-4 bg-[#c9a227]/10 rounded-xl border border-[#c9a227]/30">
                    <p className="text-[#3d4a4a] text-sm italic">
                      "And upon the first day of the week, when the disciples came together to break bread, Paul preached unto them..."
                    </p>
                    <p className="text-[#c9a227] text-sm font-medium mt-2">— Acts 20:7 (KJV 1611)</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && churches.length === 0 && !error && !apiUnavailable && (
          <div className="bg-[#f5f0e6] rounded-2xl p-8 sm:p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#c9a227]/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-[#c9a227]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-2xl font-serif font-bold text-[#3d4a4a] mb-4">
              Find Your Church Home
            </h3>
            <p className="text-[#3d4a4a]/70 mb-6 max-w-md mx-auto">
              Enter your city or zip code above, or click "Near Me" to discover Bible-believing churches in your area. 
              Churches will be sorted by distance from your location!
            </p>
            
            {/* Additional Scripture */}
            <div className="max-w-lg mx-auto p-4 bg-[#c9a227]/10 rounded-xl border border-[#c9a227]/30 mb-6">
              <p className="text-[#3d4a4a] italic">
                "And he came to Nazareth, where he had been brought up: and, as his custom was, he went into the synagogue on the sabbath day, and stood up for to read."
              </p>
              <p className="text-[#c9a227] font-medium mt-2">— Luke 4:16 (KJV 1611)</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={searchNearMe}
                disabled={gettingLocation}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-[#c9a227] text-[#1a1510] font-semibold rounded-xl hover:bg-[#b8931f] transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span>Find Churches Near Me</span>
              </button>
              <button
                onClick={onNavigateToBaptism}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-[#7c9a7a] text-[#f5f0e6] font-semibold rounded-xl hover:bg-[#6b8969] transition-colors"
              >
                <span>Learn About Baptism</span>
              </button>
            </div>
          </div>
        )}

        {/* Baptism Request Modal */}
        {showBaptismModal && selectedChurch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-[#f5f0e6] rounded-2xl p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              {!baptismSubmitted ? (
                <>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-serif font-bold text-[#3d4a4a]">
                        Request Baptism
                      </h3>
                      <p className="text-[#3d4a4a]/70 text-sm mt-1">
                        at {selectedChurch.name}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowBaptismModal(false)}
                      className="p-2 hover:bg-[#3d4a4a]/10 rounded-full transition-colors"
                    >
                      <svg className="w-5 h-5 text-[#3d4a4a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="mb-6 p-4 bg-[#c9a227]/10 rounded-xl border border-[#c9a227]/30">
                    <p className="text-[#3d4a4a] text-sm italic">
                      "Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost."
                    </p>
                    <p className="text-[#c9a227] text-sm font-medium mt-2">— Matthew 28:19 (KJV 1611)</p>
                  </div>

                  <form onSubmit={submitBaptismRequest} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#3d4a4a] mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={baptismRequest.name}
                        onChange={(e) => setBaptismRequest(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-2 border border-[#3d4a4a]/20 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#3d4a4a] mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={baptismRequest.email}
                        onChange={(e) => setBaptismRequest(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-2 border border-[#3d4a4a]/20 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#3d4a4a] mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={baptismRequest.phone}
                        onChange={(e) => setBaptismRequest(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-2 border border-[#3d4a4a]/20 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#3d4a4a] mb-1">
                        Message (Optional)
                      </label>
                      <textarea
                        rows={3}
                        value={baptismRequest.message}
                        onChange={(e) => setBaptismRequest(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Share your testimony or any questions..."
                        className="w-full px-4 py-2 border border-[#3d4a4a]/20 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full px-6 py-3 bg-[#c9a227] text-[#1a1510] font-semibold rounded-xl hover:bg-[#b8931f] transition-colors"
                    >
                      Submit Baptism Request
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#7c9a7a]/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#7c9a7a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-[#3d4a4a] mb-2">
                    Request Submitted!
                  </h3>
                  <p className="text-[#3d4a4a]/70 mb-6">
                    Your baptism request has been sent to {selectedChurch.name}. 
                    They will contact you soon to discuss next steps in your faith journey.
                  </p>
                  <div className="p-4 bg-[#c9a227]/10 rounded-xl border border-[#c9a227]/30 mb-6">
                    <p className="text-[#3d4a4a] italic">
                      "Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new."
                    </p>
                    <p className="text-[#c9a227] font-medium mt-2">— 2 Corinthians 5:17 (KJV 1611)</p>
                  </div>
                  <button
                    onClick={() => setShowBaptismModal(false)}
                    className="px-6 py-3 bg-[#3d4a4a] text-[#f5f0e6] font-semibold rounded-xl hover:bg-[#4d5a5a] transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChurchFinder;
