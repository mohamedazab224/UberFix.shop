// Map Icon Helper Utilities
// Provides icon and color mappings for different categories

export const getBranchIcon = (): { icon: string; color: string } => {
  return {
    icon: '🏢',
    color: '#3B82F6'
  };
};

export const getTechnicianIcon = (specialization?: string): { icon: string; color: string } => {
  const iconMap: Record<string, { icon: string; color: string }> = {
    'سباكة': { icon: '🔧', color: '#EF4444' },
    'كهرباء': { icon: '⚡', color: '#F59E0B' },
    'نجارة': { icon: '🪛', color: '#8B4513' },
    'دهان': { icon: '🎨', color: '#8B5CF6' },
    'تكييف': { icon: '❄️', color: '#3B82F6' },
    'تنظيف': { icon: '🧹', color: '#10B981' },
  };

  return iconMap[specialization || ''] || { icon: '🔨', color: '#6B7280' };
};

export const parseLocation = (location?: string): { lat: number; lng: number } | null => {
  if (!location) return null;

  try {
    // Try JSON format first: {"lat": 30.0444, "lng": 31.2357}
    if (location.trim().startsWith('{')) {
      const parsed = JSON.parse(location);
      if (parsed.lat && parsed.lng) {
        return { lat: parseFloat(parsed.lat), lng: parseFloat(parsed.lng) };
      }
    }

    // Try comma-separated format: "30.0444,31.2357"
    if (location.includes(',')) {
      const [lat, lng] = location.split(',').map(s => s.trim());
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      
      if (!isNaN(latNum) && !isNaN(lngNum)) {
        return { lat: latNum, lng: lngNum };
      }
    }
  } catch (error) {
    console.error('Error parsing location:', error);
  }

  return null;
};
