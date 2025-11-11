import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export const useVendorLocationTracking = (vendorId: string, enabled: boolean = false) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // تحديث الموقع في قاعدة البيانات
  const updateLocation = useCallback(async (location: LocationData) => {
    try {
      const { error: updateError } = await supabase
        .from('vendors')
        .update({
          current_latitude: location.latitude,
          current_longitude: location.longitude,
          location_updated_at: new Date().toISOString(),
        })
        .eq('id', vendorId);

      if (updateError) throw updateError;

      // حفظ في سجل المواقع
      const { error: historyError } = await supabase
        .from('vendor_location_history')
        .insert({
          vendor_id: vendorId,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          recorded_at: new Date().toISOString(),
        });

      if (historyError) console.error('Error saving location history:', historyError);

      setCurrentLocation(location);
    } catch (err) {
      console.error('Error updating location:', err);
      setError(err instanceof Error ? err.message : 'فشل تحديث الموقع');
    }
  }, [vendorId]);

  // بدء تتبع الموقع
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('المتصفح لا يدعم خاصية تحديد الموقع');
      toast({
        title: "خطأ",
        description: "المتصفح لا يدعم خاصية تحديد الموقع",
        variant: "destructive",
      });
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        updateLocation(locationData);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError(err.message);
        toast({
          title: "خطأ في تحديد الموقع",
          description: err.message,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    setIsTracking(true);

    // تحديث حالة التتبع في قاعدة البيانات
    supabase
      .from('vendors')
      .update({ is_tracking_enabled: true })
      .eq('id', vendorId)
      .then(({ error }) => {
        if (error) console.error('Error enabling tracking:', error);
      });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [updateLocation, vendorId]);

  // إيقاف تتبع الموقع
  const stopTracking = useCallback(async () => {
    setIsTracking(false);

    try {
      await supabase
        .from('vendors')
        .update({ is_tracking_enabled: false })
        .eq('id', vendorId);
    } catch (err) {
      console.error('Error disabling tracking:', err);
    }
  }, [vendorId]);

  // بدء التتبع التلقائي إذا كان مفعلاً
  useEffect(() => {
    if (enabled && !isTracking) {
      startTracking();
    }

    return () => {
      if (isTracking) {
        stopTracking();
      }
    };
  }, [enabled]);

  return {
    isTracking,
    currentLocation,
    error,
    startTracking,
    stopTracking,
  };
};
