import { useState } from 'react';
import { Star, MapPin } from 'lucide-react';
import { formatDistance } from '@/utils/distanceCalculator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';

interface TechnicianInfoWindowProps {
  name: string;
  specialization?: string;
  rating?: number;
  phone?: string;
  distance?: number;
  technicianId: string;
  onRequestSent?: () => void;
}

export const TechnicianInfoWindow = ({ 
  name, 
  specialization, 
  rating = 5,
  phone,
  distance,
  technicianId,
  onRequestSent
}: TechnicianInfoWindowProps) => {
  const [showForm, setShowForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName || !customerPhone || !description) {
      alert('الرجاء ملء جميع الحقول');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .insert([{
          title: `طلب خدمة من ${customerName}`,
          client_name: customerName,
          client_phone: customerPhone,
          description: description,
          branch_id: '00000000-0000-0000-0000-000000000000',
          company_id: '00000000-0000-0000-0000-000000000000',
          status: 'Open',
          priority: 'normal'
        }]);

      if (error) throw error;

      alert(`تم إرسال طلبك إلى ${name} بنجاح`);
      
      if (onRequestSent) {
        onRequestSent();
      }

      // Close the info window
      const infoWindow = document.querySelector('.gm-style-iw-c');
      if (infoWindow) {
        const closeButton = infoWindow.querySelector('[aria-label="Close"]') as HTMLElement;
        closeButton?.click();
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('فشل إرسال الطلب، الرجاء المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  if (showForm) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-lg min-w-[280px]" style={{ fontFamily: 'Arial, sans-serif' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-base text-gray-900">طلب خدمة من {name}</h3>
          <button 
            onClick={() => setShowForm(false)}
            className="text-gray-500 hover:text-gray-700 text-xl leading-none"
          >
            ←
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Input
              placeholder="الاسم"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full h-9 text-sm"
              required
            />
          </div>
          
          <div>
            <Input
              placeholder="رقم الهاتف"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full h-9 text-sm"
              required
            />
          </div>
          
          <div>
            <Textarea
              placeholder="وصف المشكلة..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[70px] text-sm"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'جاري الإرسال...' : 'إرسال الطلب'}
          </button>
        </form>
      </div>
    );
  }

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
      {distance !== undefined && (
        <div className="flex items-center gap-1 mb-3 text-sm">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-gray-700 font-medium">{formatDistance(distance)}</span>
          <span className="text-gray-500">من موقعك</span>
        </div>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowForm(true);
        }}
        className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-2 px-4 rounded transition-colors"
      >
        طلب الخدمة
      </button>
    </div>
  );
};
