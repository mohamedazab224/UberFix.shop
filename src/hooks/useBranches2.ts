import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Branch2 {
  id: string;
  name: string;
  description?: string | null;
  location?: string | null;
  phone?: string | null;
  email?: string | null;
  map_url?: string | null;
  category?: string | null;
  status?: string | null;
  area?: number | null;
  opening_date?: string | null;
  region_id?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useBranches2 = () => {
  const [branches, setBranches] = useState<Branch2[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchBranches = async () => {
    try {
      setLoading(true);
      setError(null);

      // Direct query with explicit column selection
      const { data, error: dbError } = await (supabase as any)
        .from('branches2')
        .select('id, name, description, location, phone, email, map_url, category, status, area, opening_date, region_id, created_by, updated_by, is_deleted, created_at, updated_at')
        .eq('is_deleted', false)
        .order('name');
      
      if (dbError) throw dbError;
      setBranches(data as Branch2[] || []);
    } catch (err) {
      console.error('Error fetching branches2:', err);
      setError(err as Error);
      // Set empty array on error
      setBranches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  return {
    branches,
    loading,
    error,
    refetch: fetchBranches
  };
};
