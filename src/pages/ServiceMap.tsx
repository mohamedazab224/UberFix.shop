import { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Loader } from '@googlemaps/js-api-loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Search, 
  Navigation, 
  RefreshCw, 
  ZoomIn,
  ZoomOut,
  Store,
  Users
} from 'lucide-react';
import { useBranches2, Branch2 } from '@/hooks/useBranches2';
import { useTechnicians, Technician } from '@/hooks/useTechnicians';
import { TechnicianMarkerInfo } from '@/components/maps/TechnicianMarkerInfo';
import { TechnicianInfoWindow } from '@/components/maps/TechnicianInfoWindow';
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
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  
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
      const loader = new Loader({
        apiKey: apiKey,
        version: 'weekly',
        libraries: ['places'],
        language: 'ar',
        region: 'EG'
      });

      await loader.load();
      
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

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);

    const newMarkers: google.maps.Marker[] = [];
    const bounds = new google.maps.LatLngBounds();

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
        },
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
        setSelectedTechnician(null);
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
        },
        animation: google.maps.Animation.DROP,
      });

      marker.addListener('click', () => {
        const infoDiv = document.createElement('div');
        const root = createRoot(infoDiv);
        
        let infoWindow: google.maps.InfoWindow | null = null;
        
        root.render(
          <TechnicianInfoWindow
            name={tech.name}
            specialization={tech.specialization || 'فني صيانة'}
            rating={tech.rating || 4.7}
            phone={tech.phone || ''}
            email={tech.email || undefined}
            status={tech.status === 'online' ? 'available' : 'busy'}
            workingHours={tech.available_from && tech.available_to ? `${tech.available_from} - ${tech.available_to}` : '08:00 - 16:00'}
            pricePerHour={tech.hourly_rate || 130}
            serviceRadius={tech.service_area_radius || 10}
            onClose={() => {
              if (infoWindow) {
                infoWindow.close();
              }
            }}
          />
        );

        infoWindow = new google.maps.InfoWindow({
          content: infoDiv
        });
        infoWindow.open(map, marker);
        
        setSelectedTechnician(tech);
        setSelectedBranch(null);
        map.panTo(position);
        map.setZoom(15);
      });

      newMarkers.push(marker);
      bounds.extend(position);
    });

    setMarkers(newMarkers);
    
    if (newMarkers.length > 0) {
      map.fitBounds(bounds);
    }
  };

  // Helper to parse map_url from branches2
  const parseMapUrl = (mapUrl: string): { lat: number; lng: number } | null => {
    try {
      // Try to extract coordinates from Google Maps URL
      const match = mapUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (match) {
        return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
      }
      
      // Try to parse as JSON
      const parsed = JSON.parse(mapUrl);
      if (parsed.lat && parsed.lng) {
        return { lat: parseFloat(parsed.lat), lng: parseFloat(parsed.lng) };
      }
    } catch (e) {
      console.error('Error parsing map_url:', e);
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

        {/* Selected Technician Info */}
        {selectedTechnician && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 max-w-md">
            <TechnicianMarkerInfo
              technician={selectedTechnician}
              onRequestService={handleRequestService}
              onClose={() => setSelectedTechnician(null)}
            />
          </div>
        )}

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
