import { Star } from 'lucide-react';

interface TechnicianInfoWindowProps {
  name: string;
  specialization?: string;
  rating?: number;
  phone?: string;
  onRequestService?: () => void;
}

export const TechnicianInfoWindow = ({ 
  name, 
  specialization, 
  rating = 5,
  phone,
  onRequestService
}: TechnicianInfoWindowProps) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-lg min-w-[200px]" style={{ fontFamily: 'Arial, sans-serif' }}>
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
      {specialization && (
        <p className="text-sm text-gray-600 mb-2">{specialization}</p>
      )}
      <div className="flex items-center gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      {phone && (
        <p className="text-sm text-gray-600 mb-3">{phone}</p>
      )}
      {onRequestService && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRequestService();
          }}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-2 px-4 rounded transition-colors"
        >
          طلب الخدمة
        </button>
      )}
    </div>
  );
};
