import { Star, MapPin, Phone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface TechnicianInfoWindowProps {
  name: string;
  specialization?: string;
  rating?: number;
  totalReviews?: number;
  phone?: string;
  location?: string;
  status?: 'available' | 'busy';
  onRequestService?: () => void;
  onClose?: () => void;
}

export const TechnicianInfoWindow = ({ 
  name, 
  specialization, 
  rating = 4.7,
  totalReviews = 82,
  phone,
  location = 'كردسة',
  status = 'available',
  onRequestService,
  onClose
}: TechnicianInfoWindowProps) => {
  const handleContact = () => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const getInitials = (name: string) => {
    const names = name.split(' ');
    return names.length > 1 ? names[0][0] + names[1][0] : name[0];
  };

  return (
    <Card className="min-w-[320px] max-w-[360px] shadow-2xl border-0 rounded-2xl overflow-hidden">
      <CardContent className="p-0">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute left-3 top-3 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-md transition-all"
        >
          ✕
        </button>

        {/* Header with Avatar */}
        <div className="relative bg-gradient-to-br from-primary/5 to-primary/10 p-6 pb-4">
          <div className="flex flex-col items-center">
            <Avatar className="w-20 h-20 border-4 border-white shadow-lg mb-3">
              <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/80 text-white">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <h3 className="font-bold text-2xl text-center mb-1">{name}</h3>
            <Badge 
              variant="secondary"
              className="bg-[#f5bf23] text-black hover:bg-[#f5bf23] font-semibold px-3 py-1"
            >
              {status === 'available' ? 'متاح حالياً' : 'دهان'}
            </Badge>
          </div>
        </div>

        {/* Rating Section */}
        <div className="flex items-center justify-center gap-3 py-4 border-b bg-white">
          <div className="flex items-center gap-1">
            <span className="text-3xl font-bold">{rating}</span>
            <Star className="w-6 h-6 fill-[#f5bf23] text-[#f5bf23]" />
          </div>
          <span className="text-sm text-muted-foreground">(تقييم {totalReviews})</span>
        </div>

        {/* Info Section */}
        <div className="p-4 space-y-3 bg-white">
          {/* Location */}
          <div className="flex items-center gap-3 py-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <span className="text-base">{location}</span>
          </div>

          {/* Phone */}
          {phone && (
            <div className="flex items-center gap-3 py-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <span className="text-base" dir="ltr">{phone}</span>
            </div>
          )}

          {/* Status */}
          <div className="flex items-center gap-3 py-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">⏰</span>
            </div>
            <span className="text-base">متاح غداً</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 p-4 bg-muted/30">
          <Button 
            variant="outline" 
            onClick={handleContact}
            className="flex-1 h-12 font-semibold border-2"
          >
            تواصل
          </Button>
          <Button 
            onClick={onRequestService}
            className="flex-1 h-12 bg-[#2563eb] hover:bg-[#2563eb]/90 text-white font-semibold shadow-lg"
          >
            اطلب الخدمة
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
