import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, RefreshCw } from "lucide-react";
import { GoogleMap } from "@/components/maps/GoogleMap";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface VendorLocationTrackerProps {
  vendorId: string;
  currentLatitude: number | null;
  currentLongitude: number | null;
  isTrackingEnabled: boolean;
}

export const VendorLocationTracker = ({
  vendorId,
  currentLatitude,
  currentLongitude,
  isTrackingEnabled,
}: VendorLocationTrackerProps) => {
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    updatedAt: string | null;
  } | null>(
    currentLatitude && currentLongitude
      ? { lat: currentLatitude, lng: currentLongitude, updatedAt: null }
      : null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!vendorId) return;

    // الاشتراك في التحديثات الفورية
    const channel = supabase
      .channel(`vendor-location-${vendorId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "vendors",
          filter: `id=eq.${vendorId}`,
        },
        (payload) => {
          const newData = payload.new as any;
          if (newData.current_latitude && newData.current_longitude) {
            setLocation({
              lat: newData.current_latitude,
              lng: newData.current_longitude,
              updatedAt: newData.location_updated_at,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [vendorId]);

  const refreshLocation = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("vendors")
        .select("current_latitude, current_longitude, location_updated_at")
        .eq("id", vendorId)
        .single();

      if (error) throw error;

      if (data.current_latitude && data.current_longitude) {
        setLocation({
          lat: data.current_latitude,
          lng: data.current_longitude,
          updatedAt: data.location_updated_at,
        });
        toast({
          title: "تم تحديث الموقع",
          description: "تم تحديث موقع الفني بنجاح",
        });
      }
    } catch (error) {
      console.error("Error refreshing location:", error);
      toast({
        title: "خطأ",
        description: "فشل تحديث الموقع",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isTrackingEnabled) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Navigation className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">تتبع الموقع غير مفعل</p>
          <p className="text-sm text-muted-foreground">
            يجب على الفني تفعيل خاصية تتبع الموقع لعرض موقعه الحالي
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!location) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">لا يوجد موقع محدد</p>
          <p className="text-sm text-muted-foreground">
            لم يتم تحديد موقع الفني بعد
          </p>
          <Button onClick={refreshLocation} disabled={loading} className="mt-4">
            <RefreshCw className={`h-4 w-4 ml-2 ${loading ? "animate-spin" : ""}`} />
            تحديث الموقع
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-primary" />
              الموقع الحالي
            </CardTitle>
            <div className="flex items-center gap-2">
              {location.updatedAt && (
                <Badge variant="outline">
                  آخر تحديث:{" "}
                  {formatDistanceToNow(new Date(location.updatedAt), {
                    addSuffix: true,
                    locale: ar,
                  })}
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={refreshLocation}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ml-2 ${loading ? "animate-spin" : ""}`} />
                تحديث
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg overflow-hidden border">
            <GoogleMap
              latitude={location.lat}
              longitude={location.lng}
              zoom={15}
              height="500px"
              interactive={true}
              markers={[
                {
                  id: vendorId,
                  lat: location.lat,
                  lng: location.lng,
                  title: "موقع الفني",
                  type: "vendor",
                  color: "green",
                },
              ]}
            />
          </div>
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">الإحداثيات</p>
                <p className="text-sm text-muted-foreground">
                  خط العرض: {location.lat.toFixed(6)} | خط الطول:{" "}
                  {location.lng.toFixed(6)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
