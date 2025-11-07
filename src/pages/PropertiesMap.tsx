import { useEffect, useRef, useState } from "react";
import { useProperties } from "@/hooks/useProperties";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Layers, ZoomIn, ZoomOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { loadGoogleMaps } from "@/lib/googleMapsLoader";

const GOOGLE_MAPS_API_KEY = "AIzaSyBNqGzF5H9mYGZbKCaF3f8YPo8wX6qJpXs"; // من الـ secrets

const PropertiesMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const { properties, loading } = useProperties();
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    loadGoogleMaps(GOOGLE_MAPS_API_KEY).then(() => {
      if (mapRef.current && !mapInstanceRef.current) {
        // إنشاء الخريطة
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: { lat: 30.0444, lng: 31.2357 }, // القاهرة
          zoom: 12,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        });
        setMapLoaded(true);
      }
    }).catch((e) => {
      console.error("Error loading Google Maps", e);
    });
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || loading) return;

    // مسح العلامات القديمة
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();
    let hasValidCoordinates = false;

    // إضافة علامات للعقارات
    properties.forEach((property) => {
      if (property.latitude && property.longitude) {
        hasValidCoordinates = true;
        
        const position = {
          lat: Number(property.latitude),
          lng: Number(property.longitude)
        };

        // إنشاء علامة مخصصة
        const marker = new google.maps.Marker({
          position,
          map: mapInstanceRef.current,
          title: property.name,
          icon: property.icon_url ? {
            url: property.icon_url,
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 40)
          } : {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#f5bf23",
            fillOpacity: 1,
            strokeColor: "#111",
            strokeWeight: 2
          }
        });

        // إنشاء نافذة معلومات
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 12px; min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #111;">
                ${property.name}
              </h3>
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">
                ${property.address}
              </p>
              <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                <span style="background: #f5bf23; color: #111; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                  ${property.type}
                </span>
                <span style="background: #e5e7eb; color: #111; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                  ${property.status}
                </span>
              </div>
              ${property.area ? `<p style="margin: 4px 0; font-size: 12px; color: #666;">المساحة: ${property.area} م²</p>` : ''}
              <button 
                onclick="window.location.href='/properties/edit/${property.id}'"
                style="margin-top: 8px; background: #f5bf23; color: #111; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 14px; width: 100%;"
              >
                عرض التفاصيل
              </button>
            </div>
          `
        });

        marker.addListener("click", () => {
          setSelectedProperty(property);
          infoWindow.open(mapInstanceRef.current, marker);
        });

        bounds.extend(position);
        markersRef.current.push(marker);
      }
    });

    // تكبير الخريطة لتشمل جميع العلامات
    if (hasValidCoordinates && markersRef.current.length > 0) {
      mapInstanceRef.current.fitBounds(bounds);
      
      // التأكد من أن التكبير ليس كبيرًا جدًا
      const listener = google.maps.event.addListener(mapInstanceRef.current, "idle", () => {
        const zoom = mapInstanceRef.current?.getZoom();
        if (zoom && zoom > 16) {
          mapInstanceRef.current?.setZoom(16);
        }
        google.maps.event.removeListener(listener);
      });
    }
  }, [mapLoaded, properties, loading]);

  const typeConfig: Record<string, { label: string; color: string }> = {
    residential: { label: "سكني", color: "bg-green-500" },
    commercial: { label: "تجاري", color: "bg-blue-500" },
    industrial: { label: "صناعي", color: "bg-orange-500" },
    office: { label: "مكتبي", color: "bg-purple-500" },
    retail: { label: "تجزئة", color: "bg-teal-500" }
  };

  const zoomIn = () => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom() || 12;
      mapInstanceRef.current.setZoom(currentZoom + 1);
    }
  };

  const zoomOut = () => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom() || 12;
      mapInstanceRef.current.setZoom(currentZoom - 1);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MapPin className="h-8 w-8 text-primary" />
            خريطة العقارات
          </h1>
          <p className="text-muted-foreground mt-2">
            عرض جميع العقارات على الخريطة مع أيقوناتها المخصصة
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {properties.length} عقار
          </Badge>
          <Button variant="outline" onClick={() => navigate("/properties")}>
            عرض القائمة
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(typeConfig).map(([type, config]) => {
          const count = properties.filter(p => p.type === type).length;
          return count > 0 ? (
            <Card key={type}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
                  <div>
                    <p className="text-xs text-muted-foreground">{config.label}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null;
        })}
      </div>

      {/* Map Container */}
      <Card className="relative overflow-hidden">
        <CardContent className="p-0">
          <div 
            ref={mapRef} 
            className="w-full h-[600px] rounded-lg"
          />
          
          {/* Map Controls */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <Button
              variant="secondary"
              size="icon"
              onClick={zoomIn}
              className="bg-white hover:bg-gray-100 shadow-lg"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={zoomOut}
              className="bg-white hover:bg-gray-100 shadow-lg"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </div>

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">جاري تحميل العقارات...</p>
              </div>
            </div>
          )}

          {/* No Properties Message */}
          {!loading && properties.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-semibold">لا توجد عقارات لعرضها</p>
                <p className="text-sm text-muted-foreground mt-2">قم بإضافة عقارات أولاً</p>
                <Button 
                  className="mt-4"
                  onClick={() => navigate("/properties/add")}
                >
                  إضافة عقار جديد
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Layers className="h-5 w-5" />
            مفتاح الخريطة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(typeConfig).map(([type, config]) => (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full ${config.color}`}></div>
                <span className="text-sm">{config.label}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            💡 انقر على أي علامة على الخريطة لعرض تفاصيل العقار
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertiesMap;
