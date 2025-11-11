import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Property {
  id: string;
  name: string;
  code?: string;
  type: string;
  status: string;
  address: string;
  latitude?: number;
  longitude?: number;
  area?: number;
  rooms?: number;
  manager_id?: string;
  region_id?: string;
  description?: string;
  amenities?: string[];
  maintenance_schedule?: string;
  last_inspection_date?: string;
  next_inspection_date?: string;
  icon_url?: string;
  qr_code_data?: string;
  city_id?: number;
  district_id?: number;
  images?: string[];
  created_at: string;
  updated_at: string;
}

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProperties();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('properties-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'properties' },
        () => {
          fetchProperties();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties((data || []) as Property[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const addProperty = async (propertyData: Omit<Property, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Adding property with data:', propertyData);
      const { data, error } = await supabase
        .from('properties')
        .insert([propertyData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      console.log('Property added successfully:', data);
      return { success: true, data };
    } catch (err) {
      console.error('Add property error:', err);
      return { success: false, error: err instanceof Error ? err.message : 'خطأ في إضافة العقار' };
    }
  };

  const updateProperty = async (id: string, updates: Partial<Property>) => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'خطأ في تحديث العقار' };
    }
  };

  return { properties, loading, error, addProperty, updateProperty, refetch: fetchProperties };
};