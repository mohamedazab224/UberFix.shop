// Map category to icon file and color
export const getCategoryIcon = (category?: string): { icon: string; color: string } => {
  if (!category) {
    return { icon: '/icons/pin-pro/pin-pro-32.svg', color: '#f5bf23' }; // default yellow
  }

  const categoryLower = category.toLowerCase();

  // Technician/Worker icons - Orange
  if (categoryLower.includes('فني') || categoryLower.includes('عامل') || categoryLower.includes('صيانة')) {
    return { icon: '/icons/pin-pro/pin-pro-5.svg', color: '#faab11' };
  }

  // Shop/Store icons - Blue
  if (categoryLower.includes('محل') || categoryLower.includes('متجر') || categoryLower.includes('دكان')) {
    return { icon: '/icons/pin-pro/pin-pro-49.svg', color: '#1800ad' };
  }

  // Repair/Fix icons - Orange
  if (categoryLower.includes('إصلاح') || categoryLower.includes('تصليح')) {
    return { icon: '/icons/pin-pro/pin-pro-14.svg', color: '#faab11' };
  }

  // Default - Yellow
  return { icon: '/icons/pin-pro/pin-pro-32.svg', color: '#f5bf23' };
};

// Parse location string to lat/lng
export const parseLocation = (location?: string): { lat: number; lng: number } | null => {
  if (!location) return null;

  try {
    // Try to parse JSON format: {"lat": 30.0444, "lng": 31.2357}
    const parsed = JSON.parse(location);
    if (parsed.lat && parsed.lng) {
      return { lat: parseFloat(parsed.lat), lng: parseFloat(parsed.lng) };
    }
  } catch {
    // Try to parse comma-separated format: "30.0444,31.2357"
    const parts = location.split(',');
    if (parts.length === 2) {
      const lat = parseFloat(parts[0].trim());
      const lng = parseFloat(parts[1].trim());
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
  }

  return null;
};
