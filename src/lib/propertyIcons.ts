// Property type to icon mapping
export const getPropertyIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    residential: '/icons/properties/residential.svg',
    commercial: '/icons/properties/commercial.svg',
    industrial: '/icons/properties/Industrial.svg',
    office: '/icons/properties/office.svg',
    retail: '/icons/properties/retail.svg',
    mixed_use: '/icons/properties/uberfix.svg',
  };

  return iconMap[type] || iconMap.residential;
};

// Get property type label in Arabic
export const getPropertyTypeLabel = (type: string): string => {
  const labelMap: Record<string, string> = {
    residential: 'سكني',
    commercial: 'تجاري',
    industrial: 'صناعي',
    office: 'مكتبي',
    retail: 'تجزئة',
    mixed_use: 'متعدد الاستخدام',
  };

  return labelMap[type] || type;
};
