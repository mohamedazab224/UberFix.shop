import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '@/lib/googleMapsLoader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getCachedApiKey, setCachedApiKey } from '@/lib/mapsCache';

// إضافة تعريفات TypeScript لـ Google Maps
/// <reference types="google.maps" />

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  type?: 'vendor' | 'request' | 'user' | 'branch';
  icon?: string;
  color?: string;
  data?: any;
}

interface GoogleMapProps {
  latitude?: number;
  longitude?: number;
  onLocationSelect?: (lat: number, lng: number, address?: string) => void;
  markers?: MapMarker[];
  zoom?: number;
  height?: string;
  interactive?: boolean;
  onMarkerClick?: (marker: MapMarker) => void;
}

export const GoogleMap: React.FC<GoogleMapProps> = ({
  latitude = 24.7136,
  longitude = 46.6753, // الرياض كموقع افتراضي
  onLocationSelect,
  markers = [],
  zoom = 10,
  height = '400px',
  interactive = true,
  onMarkerClick
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [mapMarkers, setMapMarkers] = useState<google.maps.Marker[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // جلب API key من متغيرات البيئة أو السيكريت
    fetchApiKey();
  }, []);

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
      
      // جلب API key من Supabase Edge Function
      const response = await supabase.functions.invoke('get-maps-key');
      
      if (response.data && response.data.apiKey) {
        console.log('✅ API Key loaded from server');
        const key = response.data.apiKey;
        
        // حفظ في cache
        setCachedApiKey(key);
        setApiKey(key);
      } else {
        console.error('❌ Failed to fetch API key:', response.error);
        toast({
          title: "خطأ في تحميل مفتاح API",
          description: `فشل في جلب مفتاح Google Maps: ${response.error?.message || 'خطأ غير معروف'}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Error fetching API key:', error);
      toast({
        title: "خطأ في الاتصال",
        description: `فشل الاتصال بالخادم: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!apiKey || !mapRef.current || map) return;

    initializeMap();
  }, [apiKey]);

  useEffect(() => {
    if (map && (latitude !== 24.7136 || longitude !== 46.6753)) {
      map.setCenter({ lat: latitude, lng: longitude });
      map.setZoom(zoom);
    }
  }, [map, latitude, longitude, zoom]);

  const initializeMap = async () => {
    try {
      setIsLoading(true);
      console.log('🗺️ Initializing Google Maps...');
      
      console.log('📦 Loading Google Maps API...');
      await loadGoogleMaps(apiKey);
      console.log('✅ Google Maps API loaded successfully');
      
      const mapInstance = new google.maps.Map(mapRef.current!, {
        center: { lat: latitude, lng: longitude },
        zoom: zoom,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: interactive ? 'auto' : 'none',
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          }
        ]
      });

      setMap(mapInstance);

      // إضافة الماركرز
      if (markers.length > 0) {
        addMarkers(mapInstance);
      }

      // إضافة إمكانية النقر على الخريطة لتحديد الموقع
      if (onLocationSelect && interactive) {
        mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            
            // الحصول على العنوان من الإحداثيات
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode(
              { location: { lat, lng } },
              (results, status) => {
                if (status === 'OK' && results && results[0]) {
                  onLocationSelect(lat, lng, results[0].formatted_address);
                } else {
                  onLocationSelect(lat, lng);
                }
              }
            );
          }
        });
      }

      setIsLoading(false);
    } catch (error) {
      console.error('❌ Error loading Google Maps:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      setIsLoading(false);
      
      toast({
        title: "خطأ في تحميل الخريطة",
        description: error instanceof Error ? error.message : "تأكد من صحة API Key ومن تفعيل Google Maps API.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (map && markers.length > 0) {
      addMarkers(map);
    }
  }, [map, markers]);

  const addMarkers = (mapInstance: google.maps.Map) => {
    // Clear existing markers
    mapMarkers.forEach(marker => marker.setMap(null));
    setMapMarkers([]);

    const newMarkers: google.maps.Marker[] = [];

    markers.forEach(marker => {
      const markerOptions: google.maps.MarkerOptions = {
        position: { lat: marker.lat, lng: marker.lng },
        map: mapInstance,
        title: marker.title,
      };

      // Use custom icon if provided
      if (marker.icon) {
        markerOptions.icon = {
          url: marker.icon,
          scaledSize: new google.maps.Size(40, 50),
          anchor: new google.maps.Point(20, 50),
        };
      } else {
        markerOptions.icon = getMarkerIcon(marker.type);
      }

      const mapMarker = new google.maps.Marker(markerOptions);

      mapMarker.addListener('click', () => {
        if (onMarkerClick) {
          onMarkerClick(marker);
        } else {
          const infoWindow = new google.maps.InfoWindow({
            content: `<div style="padding: 8px;"><strong>${marker.title}</strong></div>`
          });
          infoWindow.open(mapInstance, mapMarker);
        }
      });

      newMarkers.push(mapMarker);
    });

    setMapMarkers(newMarkers);
  };

  const getMarkerIcon = (type?: string) => {
    const baseUrl = 'https://maps.google.com/mapfiles/ms/icons/';
    switch (type) {
      case 'vendor':
        return baseUrl + 'blue-dot.png';
      case 'request':
        return baseUrl + 'red-dot.png';
      case 'user':
        return baseUrl + 'green-dot.png';
      default:
        return baseUrl + 'red-dot.png';
    }
  };

  const searchLocation = async () => {
    if (!map || !searchValue.trim()) return;

    try {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        { address: searchValue },
        (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;
            map.setCenter(location);
            map.setZoom(15);
            
            if (onLocationSelect) {
              onLocationSelect(
                location.lat(),
                location.lng(),
                results[0].formatted_address
              );
            }
          } else {
            toast({
              title: "لم يتم العثور على الموقع",
              description: "تأكد من صحة العنوان المدخل",
              variant: "destructive",
            });
          }
        }
      );
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "الموقع غير مدعوم",
        description: "متصفحك لا يدعم خدمة تحديد الموقع",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        if (map) {
          map.setCenter({ lat, lng });
          map.setZoom(15);
        }
        
        if (onLocationSelect) {
          onLocationSelect(lat, lng);
        }
      },
      (error) => {
        toast({
          title: "خطأ في تحديد الموقع",
          description: "تأكد من السماح للموقع بالوصول إلى موقعك",
          variant: "destructive",
        });
      }
    );
  };

  if (!apiKey) {
    return (
      <Card className="w-full" style={{ height }}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">مطلوب Google Maps API Key</h3>
            <p className="text-muted-foreground mb-4">
              للحصول على API Key، قم بزيارة Google Cloud Console
            </p>
            <Button onClick={fetchApiKey} variant="outline">
              إعادة المحاولة
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-4">
      {interactive && (
        <div className="flex gap-2">
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="البحث عن موقع..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
            />
            <Button onClick={searchLocation} size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={getCurrentLocation} size="icon" variant="outline">
            <Navigation className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <Card className="w-full" style={{ height }}>
        <CardContent className="p-0 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">جاري تحميل الخريطة...</p>
              </div>
            </div>
          )}
          <div ref={mapRef} className="w-full h-full rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
};