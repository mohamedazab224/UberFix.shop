import { Star, Clock, MapPin, Phone, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface TechnicianInfoWindowProps {
  name: string;
  specialization?: string;
  rating?: number;
  phone?: string;
  email?: string;
  status?: 'available' | 'busy';
  workingHours?: string;
  pricePerHour?: number;
  serviceRadius?: number;
  onClose?: () => void;
}

export const TechnicianInfoWindow = ({ 
  name, 
  specialization, 
  rating = 4.7,
  phone,
  email,
  status = 'busy',
  workingHours = '08:00 - 16:00',
  pricePerHour = 130,
  serviceRadius = 10,
  onClose
}: TechnicianInfoWindowProps) => {
  const handleCallTechnician = () => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const getInitials = (name: string) => {
    const names = name.split(' ');
    return names.length > 1 ? names[0][0] + names[1][0] : name[0];
  };

  return (
    <Card className="min-w-[340px] max-w-[380px] shadow-xl border-0 rounded-xl">
      <CardContent className="p-6 space-y-4">
        {/* Header with Avatar and Status */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-16 h-16 bg-primary/10">
              <AvatarFallback className="text-xl font-bold bg-primary/20 text-primary">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-xl mb-1">{name}</h3>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={status === 'available' ? 'default' : 'secondary'}
                  className={status === 'available' ? 'bg-[#f5bf23] text-black hover:bg-[#f5bf23]/90' : 'bg-[#f5bf23] text-black'}
                >
                  {status === 'available' ? 'متاح' : 'مشغول'}
                </Badge>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">(تقييم: {rating})</span>
                  <Star className="w-4 h-4 fill-[#f5bf23] text-[#f5bf23]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specialization */}
        {specialization && (
          <p className="text-sm text-muted-foreground text-center py-2 border-y">
            {specialization}
          </p>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Working Hours */}
          <div className="flex flex-col items-center gap-1">
            <Clock className="w-5 h-5 text-primary" />
            <span className="text-xs text-muted-foreground">ساعات العمل</span>
            <span className="text-sm font-semibold">{workingHours}</span>
          </div>

          {/* Price */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-primary">₪</span>
            <span className="text-xs text-muted-foreground">السعر/ساعة</span>
            <span className="text-sm font-semibold">{pricePerHour} ج.م</span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 pt-2">
          {phone && (
            <div className="flex items-center justify-center gap-2 text-sm">
              <Phone className="w-4 h-4" />
              <span dir="ltr">{phone}</span>
            </div>
          )}
          {email && (
            <div className="flex items-center justify-center gap-2 text-sm">
              <Mail className="w-4 h-4" />
              <span>{email}</span>
            </div>
          )}
          {serviceRadius && (
            <div className="flex items-center justify-center gap-2 text-sm">
              <MapPin className="w-4 h-4" />
              <span>نطاق الخدمة: {serviceRadius} كم</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1"
          >
            إغلاق
          </Button>
          <Button 
            onClick={handleCallTechnician}
            className="flex-1 bg-[#111] hover:bg-[#111]/90 text-white"
          >
            <Phone className="w-4 h-4 ml-2" />
            طلب خدمة فورية
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
