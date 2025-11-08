import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Phone, Navigation, DollarSign, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EnhancedServiceCardProps {
  technicianId: string;
  name: string;
  specialization: string;
  rating: number;
  status: 'available' | 'busy';
  hourlyRate?: number;
  phone?: string;
  distance?: string | null;
  onClose: () => void;
}

export function EnhancedServiceCard({
  technicianId,
  name,
  specialization,
  rating,
  status,
  hourlyRate = 0,
  phone = '',
  distance = null,
  onClose
}: EnhancedServiceCardProps) {
  const navigate = useNavigate();

  const handleRequestService = () => {
    navigate('/service-request', { state: { technicianId } });
  };

  return (
    <Card className="w-80 shadow-xl border-0">
      <div className="p-4 space-y-3">
        {/* Close Button */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">{specialization}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Status & Rating */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge 
            variant={status === 'available' ? 'default' : 'secondary'}
            className="font-medium"
          >
            {status === 'available' ? '✓ متاح الآن' : '⏳ مشغول'}
          </Badge>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            <span className="font-medium">{rating.toFixed(1)}</span>
          </div>
          {distance && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Navigation className="h-3 w-3" />
              <span>{distance} كم</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-2 pt-2 border-t">
          {hourlyRate > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{hourlyRate} ج.م / ساعة</span>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a 
                href={`tel:${phone}`}
                className="text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {phone}
              </a>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Button 
          className="w-full font-bold"
          onClick={handleRequestService}
          disabled={status !== 'available'}
        >
          اطلب الخدمة الآن
        </Button>
      </div>
    </Card>
  );
}
