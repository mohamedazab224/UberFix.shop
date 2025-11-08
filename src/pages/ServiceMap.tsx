import { useState, useEffect, useRef } from 'react';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { createRoot } from 'react-dom/client';
import { loadGoogleMaps } from '@/lib/googleMapsLoader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Navigation, 
  RefreshCw, 
  ZoomIn,
  ZoomOut,
  Store,
  Users,
  Star,
  MapPin,
  Phone,
  DollarSign,
  X,
  Menu
} from 'lucide-react';
import { useBranches2, Branch2 } from '@/hooks/useBranches2';
import { useTechnicians, Technician } from '@/hooks/useTechnicians';
import { BRANCH_LOCATIONS } from '@/data/branch_locations';

import { SimpleServiceCard } from '@/components/maps/SimpleServiceCard';
import { EnhancedServiceCard } from '@/components/maps/EnhancedServiceCard';
import { BranchInfoWindow } from '@/components/maps/BranchInfoWindow';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getCachedApiKey, setCachedApiKey } from '@/lib/mapsCache';
import { getBranchIcon, getTechnicianIcon } from '@/utils/mapIconHelper';

export default function ServiceMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | undefined>();
  const [selectedBranch, setSelectedBranch] = useState<Branch2 | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [markerClusterer, setMarkerClusterer] = useState<MarkerClusterer | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  
  const { branches, loading: branchesLoading, refetch: refetchBranches } = useBranches2();
  const { technicians, specializationIcons, loading: techniciansLoading, refetch: refetchTechnicians } = useTechnicians();
  const { toast } = useToast();
  
  const loading = branchesLoading || techniciansLoading;

  useEffect(() => {
    fetchApiKey();
  }, []);

  useEffect(() => {
    if (apiKey && mapRef.current && !map) {
      initializeMap();
    }
  }, [apiKey]);

  useEffect(() => {
    if (map && (branches.length > 0 || technicians.length > 0)) {
      updateMarkers();
    }

    // تنظيف العلامات عند إلغاء التثبيت
    return () => {
      markers.forEach(marker => marker.setMap(null));
    };
  }, [map, branches, technicians, selectedSpecialization]);

  const fetchApiKey = async () => {
    try {
      // محاولة جلب من cache أولاً
      const cachedKey = getCachedApiKey();
      if (cachedKey) {
        console.log('✅ Google Maps API Key loaded from cache');
        setApiKey(cachedKey);
        return;
      }

      console.log('🗺️ Fetching Google Maps API key from server...');
      
      // جلب من Edge Function
      const response = await supabase.functions.invoke('get-maps-key');
      if (response.data?.apiKey) {
        const key = response.data.apiKey;
        console.log('✅ API Key loaded successfully');
        
        // حفظ في cache
        setCachedApiKey(key);
        setApiKey(key);
      } else {
        console.error('❌ Failed to fetch API key:', response.error);
        toast({
          title: 'خطأ',
          description: 'فشل تحميل مفتاح الخريطة',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('❌ Error fetching API key:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحميل مفتاح الخريطة',
        variant: 'destructive'
      });
    }
  };

  const initializeMap = async () => {
    try {
      await loadGoogleMaps(apiKey);
      
      const mapInstance = new google.maps.Map(mapRef.current!, {
        center: { lat: 30.0444, lng: 31.2357 }, // القاهرة
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: false,
      });

      setMap(mapInstance);
      
      // Get user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            mapInstance.setCenter(pos);
            setUserLocation(pos);
          },
          () => {
            console.log('Error getting location');
          }
        );
      }
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  const updateMarkers = () => {
    if (!map) return;

    // Clear existing markers and clusterer
    if (markerClusterer) {
      markerClusterer.clearMarkers();
    }
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);

    const newMarkers: google.maps.Marker[] = [];
    const customerMarkers: google.maps.Marker[] = [];
    const bounds = new google.maps.LatLngBounds();

    // Add customer location markers (from branch_locations)
    const customerIcon = '/icons/pin-pro/customers.png';
    const geocoder = new google.maps.Geocoder();
    
    const addCustomerMarker = (position: { lat: number; lng: number }, name: string) => {
      const marker = new google.maps.Marker({
        map,
        position,
        title: name,
        icon: {
          url: customerIcon,
          scaledSize: new google.maps.Size(50, 60),
          anchor: new google.maps.Point(25, 60),
          origin: new google.maps.Point(0, 0),
        },
        optimized: false,
      });

      marker.addListener('click', () => {
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 12px; font-family: Arial; min-width: 150px;">
              <h3 style="font-weight: bold; margin: 0 0 8px 0; color: #111; font-size: 16px;">${name}</h3>
              <p style="margin: 0; color: #666; font-size: 14px;">📍 موقع عميل</p>
            </div>
          `
        });
        infoWindow.open(map, marker);
        map.panTo(position);
        map.setZoom(14);
      });

      customerMarkers.push(marker);
      newMarkers.push(marker);
      bounds.extend(position);
    };
    
    // Process all branch locations with geocoding
    BRANCH_LOCATIONS.forEach((location, index) => {
      if (!location.mapUrl || location.name === 'nan') return;
      
      // Try to extract coordinates from URL first
      const coords = parseMapUrl(location.mapUrl);
      if (coords) {
        addCustomerMarker(coords, location.name);
      } else {
        // Extract place name from URL and geocode it
        const placeMatch = location.mapUrl.match(/q=([^&]+)/);
        if (placeMatch) {
          const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
          
          // Add delay to avoid hitting API rate limits
          setTimeout(() => {
            geocoder.geocode({ address: placeName + ', مصر' }, (results, status) => {
              if (status === 'OK' && results && results[0]) {
                const position = {
                  lat: results[0].geometry.location.lat(),
                  lng: results[0].geometry.location.lng()
                };
                addCustomerMarker(position, location.name);
              }
            });
          }, index * 100); // 100ms delay between requests
        }
      }
    });

    // Add branch markers (from branches2)
    branches.forEach((branch) => {
      // Parse location from map_url or skip if no coordinates
      if (!branch.map_url) return;
      
      const coords = parseMapUrl(branch.map_url);
      if (!coords) return;

      const position = { lat: coords.lat, lng: coords.lng };
      const branchIcon = getBranchIcon();
      
      const marker = new google.maps.Marker({
        map,
        position,
        title: branch.name,
        icon: {
          url: branchIcon.icon,
          scaledSize: new google.maps.Size(50, 60),
          anchor: new google.maps.Point(25, 60),
          origin: new google.maps.Point(0, 0),
        },
        optimized: false,
        animation: google.maps.Animation.DROP,
      });

      marker.addListener('click', () => {
        const infoDiv = document.createElement('div');
        const root = createRoot(infoDiv);
        root.render(
          <BranchInfoWindow
            name={branch.name}
            address={branch.location || ''}
            phone={branch.phone || ''}
            openingHours=""
          />
        );

        const infoWindow = new google.maps.InfoWindow({
          content: infoDiv
        });
        infoWindow.open(map, marker);
        
        setSelectedBranch(branch);
        map.panTo(position);
        map.setZoom(15);
      });

      newMarkers.push(marker);
      bounds.extend(position);
    });

    // Add technician markers
    const filteredTechs = selectedSpecialization 
      ? technicians.filter(t => t.specialization === selectedSpecialization)
      : technicians;

    filteredTechs.forEach((tech) => {
      if (!tech.current_latitude || !tech.current_longitude) return;
      
      const position = { lat: tech.current_latitude, lng: tech.current_longitude };
      
      // Get icon from specialization_icons or fallback
      const specIcon = specializationIcons.find(s => s.name === tech.specialization || s.name_ar === tech.specialization);
      const techIcon = getTechnicianIcon(tech.specialization);
      const iconUrl = specIcon?.icon_path || techIcon.icon;
      
      const marker = new google.maps.Marker({
        map,
        position,
        title: tech.name,
        icon: {
          url: iconUrl,
          scaledSize: new google.maps.Size(50, 60),
          anchor: new google.maps.Point(25, 60),
          origin: new google.maps.Point(0, 0),
        },
        optimized: false,
        animation: google.maps.Animation.DROP,
      });

      marker.addListener('click', () => {
        const infoDiv = document.createElement('div');
        const root = createRoot(infoDiv);
        
        let infoWindow: google.maps.InfoWindow | null = null;
        
        // Calculate distance if user location is available
        let distance = null;
        if (userLocation) {
          const R = 6371; // Earth radius in km
          const dLat = (position.lat - userLocation.lat) * Math.PI / 180;
          const dLng = (position.lng - userLocation.lng) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(position.lat * Math.PI / 180) *
                    Math.sin(dLng/2) * Math.sin(dLng/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          distance = (R * c).toFixed(1);
        }
        
        root.render(
          <EnhancedServiceCard
            technicianId={tech.id}
            name={tech.name}
            specialization={tech.specialization || 'فني صيانة'}
            rating={tech.rating || 4.7}
            status={tech.status === 'online' ? 'available' : 'busy'}
            hourlyRate={tech.hourly_rate || 0}
            phone={tech.phone || ''}
            distance={distance}
            onClose={() => {
              if (infoWindow) {
                infoWindow.close();
              }
            }}
          />
        );

        infoWindow = new google.maps.InfoWindow({
          content: infoDiv,
          disableAutoPan: false,
          maxWidth: 350,
        });
        infoWindow.open(map, marker);
        
        setSelectedBranch(null);
        map.panTo(position);
        map.setZoom(15);
      });

      newMarkers.push(marker);
      bounds.extend(position);
    });

    setMarkers(newMarkers);
    
    // Create clusterer for customer markers
    if (customerMarkers.length > 0) {
      const clusterer = new MarkerClusterer({
        map,
        markers: customerMarkers,
        renderer: {
          render: ({ count, position }) => {
            return new google.maps.Marker({
              position,
              icon: {
                url: customerIcon,
                scaledSize: new google.maps.Size(50, 60),
                anchor: new google.maps.Point(25, 60),
                origin: new google.maps.Point(0, 0),
              },
              label: {
                text: String(count),
                color: 'white',
                fontSize: '14px',
                fontWeight: 'bold',
              },
              zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
              optimized: false,
            });
          },
        },
      });
      setMarkerClusterer(clusterer);
    }
    
    if (newMarkers.length > 0) {
      map.fitBounds(bounds);
    }
  };

  // Helper to parse map_url from branches2 or branch_locations
  const parseMapUrl = (mapUrl: string): { lat: number; lng: number } | null => {
    try {
      // Try to extract coordinates from Google Maps URL patterns
      // Pattern 1: ?q=lat,lng
      const qMatch = mapUrl.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
      if (qMatch) {
        return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
      }
      
      // Pattern 2: @lat,lng
      const atMatch = mapUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (atMatch) {
        return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
      }
      
      // Pattern 3: /maps?...q=location_name - use Geocoding API
      // For now, we'll skip these as they need geocoding
      // Return null so the marker won't be created
      
      // Try to parse as JSON (fallback for direct coordinate objects)
      if (mapUrl.startsWith('{')) {
        const parsed = JSON.parse(mapUrl);
        if (parsed.lat && parsed.lng) {
          return { lat: parseFloat(parsed.lat), lng: parseFloat(parsed.lng) };
        }
      }
    } catch (e) {
      // Silent fail - just skip this location
    }
    return null;
  };

  const handleSearch = async () => {
    if (!map || !searchQuery.trim()) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: searchQuery }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        map.setCenter(location);
        map.setZoom(14);
        setUserLocation({
          lat: location.lat(),
          lng: location.lng(),
          address: results[0].formatted_address
        });
      }
    });
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation || !map) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        map.setCenter(pos);
        map.setZoom(15);
        setUserLocation(pos);
      },
      () => {
        toast({
          title: 'خطأ',
          description: 'فشل تحديد موقعك الحالي',
          variant: 'destructive'
        });
      }
    );
  };

  const handleRefresh = () => {
    refetchBranches();
    refetchTechnicians();
  };

  const handleRequestService = (technicianId: string) => {
    const tech = technicians.find(t => t.id === technicianId);
    if (tech) {
      toast({
        title: 'طلب خدمة',
        description: `سيتم التواصل مع ${tech.name} قريباً`,
      });
    }
  };

  const handleZoomIn = () => {
    if (map) {
      map.setZoom((map.getZoom() || 12) + 1);
    }
  };

  const handleZoomOut = () => {
    if (map) {
      map.setZoom((map.getZoom() || 12) - 1);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 border-b px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">UberFix.shop</h1>
              <p className="text-sm text-white/90">منصة الصيانة الذكية</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-4 py-2">
              <Users className="h-4 w-4 ml-2" />
              {technicians.filter(t => t.status === 'online').length} فني نشط
            </Badge>
            <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-4 py-2">
              <Store className="h-4 w-4 ml-2" />
              {branches.length} فرع
            </Badge>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-card px-4 py-3 border-b">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث عن خدمة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pr-10"
            />
          </div>
          <Button variant="default" size="icon" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Specialization Filters */}
      {specializationIcons.length > 0 && (
        <div className="absolute top-4 left-4 z-10 max-w-md">
          <Card className="p-3 bg-card/95 backdrop-blur-sm">
            <p className="text-xs font-semibold mb-2 text-muted-foreground">التخصصات:</p>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={!selectedSpecialization ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedSpecialization(undefined)}
              >
                الكل
              </Badge>
              {specializationIcons.map((spec) => (
                <Badge
                  key={spec.id}
                  variant={selectedSpecialization === spec.name ? 'default' : 'outline'}
                  className="cursor-pointer"
                  style={selectedSpecialization === spec.name ? { backgroundColor: spec.color } : {}}
                  onClick={() => setSelectedSpecialization(spec.name)}
                >
                  {spec.name_ar}
                </Badge>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Sidebar Toggle Button */}
      {!showSidebar && (
        <div className="absolute top-20 left-4 z-10">
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full shadow-lg"
            onClick={() => setShowSidebar(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Technicians Sidebar */}
      {showSidebar && (
        <div className="absolute top-20 left-4 z-10 w-80">
          <Card className="shadow-xl bg-card/98 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  الفنيون المتاحون ({technicians.filter(t => t.current_latitude && t.current_longitude).length})
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowSidebar(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                <div className="space-y-2 p-4">
                  {technicians
                    .filter(t => t.current_latitude && t.current_longitude)
                    .filter(t => !selectedSpecialization || t.specialization === selectedSpecialization)
                    .map((tech) => {
                      const specIcon = specializationIcons.find(s => s.name === tech.specialization);
                      
                      // Calculate distance if user location is available
                      let distance = null;
                      if (userLocation && tech.current_latitude && tech.current_longitude) {
                        const R = 6371;
                        const dLat = (tech.current_latitude - userLocation.lat) * Math.PI / 180;
                        const dLng = (tech.current_longitude - userLocation.lng) * Math.PI / 180;
                        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                                  Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(tech.current_latitude * Math.PI / 180) *
                                  Math.sin(dLng/2) * Math.sin(dLng/2);
                        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                        distance = (R * c).toFixed(1);
                      }
                      
                      return (
                        <Card
                          key={tech.id}
                          className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
                          onClick={() => {
                            if (tech.current_latitude && tech.current_longitude && map) {
                              map.panTo({ lat: tech.current_latitude, lng: tech.current_longitude });
                              map.setZoom(15);
                            }
                          }}
                        >
                          <CardContent className="p-3">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-bold text-sm">{tech.name}</h4>
                                  <p className="text-xs text-muted-foreground">{tech.specialization}</p>
                                </div>
                                <Badge 
                                  variant={tech.status === 'online' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {tech.status === 'online' ? 'متاح' : 'مشغول'}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-3 text-xs">
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                  <span className="font-medium">{tech.rating.toFixed(1)}</span>
                                </div>
                                
                                {distance && (
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    <span>{distance} كم</span>
                                  </div>
                                )}
                                
                                {tech.hourly_rate && tech.hourly_rate > 0 && (
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <DollarSign className="h-3 w-3" />
                                    <span>{tech.hourly_rate} ج.م/س</span>
                                  </div>
                                )}
                              </div>
                              
                              {tech.phone && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  <a 
                                    href={`tel:${tech.phone}`}
                                    className="text-primary hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {tech.phone}
                                  </a>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" />

        {/* Map Controls */}
        <div className="absolute bottom-20 left-4 flex flex-col gap-2">
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full shadow-lg bg-card hover:bg-accent"
            onClick={handleGetCurrentLocation}
          >
            <Navigation className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full shadow-lg bg-card hover:bg-accent"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-20 right-4 flex flex-col gap-2">
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full shadow-lg bg-card hover:bg-accent"
            onClick={handleZoomIn}
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full shadow-lg bg-card hover:bg-accent"
            onClick={handleZoomOut}
          >
            <ZoomOut className="h-5 w-5" />
          </Button>
        </div>

        {/* Selected Branch Info */}
        {selectedBranch && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 max-w-md">
            <Card className="w-80 shadow-xl">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{selectedBranch.name}</h3>
                    {selectedBranch.description && (
                      <p className="text-sm text-muted-foreground mt-1">{selectedBranch.description}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedBranch(null)}
                  >
                    ✕
                  </Button>
                </div>
                
                {selectedBranch.location && (
                  <p className="text-sm text-muted-foreground mb-2">📍 {selectedBranch.location}</p>
                )}
                
                {selectedBranch.phone && (
                  <p className="text-sm">📞 {selectedBranch.phone}</p>
                )}
                
                {selectedBranch.email && (
                  <p className="text-sm">✉️ {selectedBranch.email}</p>
                )}
              </div>
            </Card>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-30">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">جاري تحميل مزودي الخدمات...</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
