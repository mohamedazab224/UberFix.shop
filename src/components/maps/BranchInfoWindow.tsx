import { MapPin, Phone } from 'lucide-react';

interface BranchInfoWindowProps {
  name: string;
  address?: string;
  phone?: string;
  openingHours?: string;
}

export const BranchInfoWindow = ({ 
  name, 
  address, 
  phone,
  openingHours 
}: BranchInfoWindowProps) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-lg min-w-[250px]" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-lg text-gray-900">{name}</h3>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            const infoWindow = (e.target as HTMLElement).closest('.gm-style-iw-c');
            if (infoWindow) {
              const closeButton = infoWindow.querySelector('[aria-label="Close"]') as HTMLElement;
              closeButton?.click();
            }
          }}
          className="text-gray-500 hover:text-gray-700 text-xl leading-none"
        >
          ×
        </button>
      </div>
      {address && (
        <div className="flex items-start gap-2 mb-2">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-600" />
          <p className="text-sm text-gray-600">{address}</p>
        </div>
      )}
      {phone && (
        <div className="flex items-center gap-2 mb-2">
          <Phone className="w-4 h-4 flex-shrink-0 text-gray-600" />
          <p className="text-sm text-gray-600">{phone}</p>
        </div>
      )}
      {openingHours && (
        <p className="text-xs text-gray-500 mt-2">
          {openingHours}
        </p>
      )}
    </div>
  );
};
