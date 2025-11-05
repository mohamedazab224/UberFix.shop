import { Star, Phone, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface SimpleServiceCardProps {
  technicianId: string;
  name: string;
  specialization?: string;
  rating?: number;
  status?: 'available' | 'busy';
  onClose?: () => void;
}

export const SimpleServiceCard = ({ 
  technicianId,
  name, 
  specialization, 
  rating = 4.7,
  status = 'available',
  onClose
}: SimpleServiceCardProps) => {
  const navigate = useNavigate();

  const handleRequestService = () => {
    navigate(`/emergency-service/${technicianId}`, {
      state: { 
        technicianName: name,
        specialization,
        rating,
        status
      }
    });
  };

  return (
    <Card className="w-[280px] shadow-2xl border-0 rounded-2xl overflow-hidden bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm">
      <CardContent className="p-0">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary to-primary/80 p-4 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/icons/pattern.svg')] opacity-10" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg">{name}</h3>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="إغلاق"
              >
                ✕
              </button>
            </div>
            {specialization && (
              <p className="text-sm text-white/90">{specialization}</p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Status and Rating */}
          <div className="flex items-center justify-between">
            <Badge 
              variant={status === 'available' ? 'default' : 'secondary'}
              className={status === 'available' 
                ? 'bg-[#f5bf23] text-[#111] hover:bg-[#f5bf23]/90 px-3 py-1' 
                : 'bg-muted text-muted-foreground px-3 py-1'}
            >
              {status === 'available' ? '✓ متاح الآن' : '○ مشغول'}
            </Badge>
            <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-full">
              <Star className="w-4 h-4 fill-[#f5bf23] text-[#f5bf23]" />
              <span className="text-sm font-semibold">{rating}</span>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            onClick={handleRequestService}
            className="w-full bg-[#111] hover:bg-[#111]/90 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
            size="lg"
          >
            <Phone className="w-5 h-5 ml-2" />
            طلب صيانة طارئة
            <ArrowLeft className="w-4 h-4 mr-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
