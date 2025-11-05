import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Technician {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  specialization: string;
  profile_image?: string | null;
  rating: number;
  total_reviews: number;
  status: 'online' | 'busy' | 'offline' | 'on_route';
  current_latitude?: number | null;
  current_longitude?: number | null;
  location_updated_at?: string | null;
  hourly_rate?: number | null;
  available_from?: string | null;
  available_to?: string | null;
  bio?: string | null;
  certifications?: any;
  service_area_radius?: number | null;
  is_active: boolean;
  is_verified: boolean;
}

export interface SpecializationIcon {
  id: string;
  name: string;
  name_ar: string;
  icon_path: string;
  color: string;
  sort_order: number;
}

export const useTechnicians = (filter?: { status?: string; specialization?: string }) => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [specializationIcons, setSpecializationIcons] = useState<SpecializationIcon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = (supabase as any)
        .from('technicians')
        .select('*')
        .eq('is_active', true);

      if (filter?.status) {
        query = query.eq('status', filter.status);
      }

      if (filter?.specialization) {
        query = query.eq('specialization', filter.specialization);
      }

      const { data, error: dbError } = await query.order('rating', { ascending: false });

      if (dbError) throw dbError;
      setTechnicians(data as Technician[] || []);
    } catch (err) {
      console.error('Error fetching technicians:', err);
      setError(err as Error);
      setTechnicians([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecializationIcons = async () => {
    try {
      const { data, error: dbError } = await (supabase as any)
        .from('specialization_icons')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (dbError) throw dbError;
      setSpecializationIcons(data as SpecializationIcon[] || []);
    } catch (err) {
      console.error('Error fetching specialization icons:', err);
    }
  };

  useEffect(() => {
    fetchTechnicians();
    fetchSpecializationIcons();

    // إضافة realtime subscription
    const channel = supabase
      .channel('technicians-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'technicians' },
        () => {
          console.log('🔄 Technicians changed, refetching...');
          fetchTechnicians();
        }
      )
      .subscribe();

    return () => {
      console.log('🧹 Cleaning up technicians subscription');
      supabase.removeChannel(channel);
    };
  }, [filter?.status, filter?.specialization]);

  return {
    technicians,
    specializationIcons,
    loading,
    error,
    refetch: fetchTechnicians,
  };
};
