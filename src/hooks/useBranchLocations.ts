import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BranchLocation {
  id: string;
  branch: string;
  address: string | null;
  branch_type: string | null;
  link: string | null;
  icon: string | null;
  latitude: string | null;
  longitude: string | null;
}

export const useBranchLocations = () => {
  const [branches, setBranches] = useState<BranchLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: dbError } = await supabase
        .from('branch_locations')
        .select('*')
        .order('branch');

      if (dbError) throw dbError;
      
      // Filter out branches without coordinates
      const validBranches = (data || []).filter(
        (branch: BranchLocation) => 
          branch.latitude && 
          branch.longitude && 
          !isNaN(parseFloat(branch.latitude)) && 
          !isNaN(parseFloat(branch.longitude))
      );
      
      setBranches(validBranches as BranchLocation[]);
      console.log(`✅ Loaded ${validBranches.length} branch locations`);
    } catch (err) {
      console.error('❌ Error fetching branch locations:', err);
      setError(err as Error);
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
    refetch: fetchBranches,
  };
};
