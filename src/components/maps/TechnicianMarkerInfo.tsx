import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, Star, Clock, DollarSign, Award, MapPin } from 'lucide-react';
import { Technician } from '@/hooks/useTechnicians';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TechnicianMarkerInfoProps {
  technician: Technician;
  specializationNameAr?: string;
  onRequestService: (technicianId: string) => void;
  onClose: () => void;
}

export const TechnicianMarkerInfo = ({ 
  technician, 
  specializationNameAr,
  onRequestService, 
  onClose 
}: TechnicianMarkerInfoProps) => {
  const getStatusBadge = () => {
    const statusMap = {
      online: { label: 'متاح الآن', variant: 'default' as const, className: 'bg-green-500' },
      busy: { label: 'مشغول', variant: 'secondary' as const, className: 'bg-orange-500 text-white' },
      on_route: { label: 'في الطريق', variant: 'secondary' as const, className: 'bg-blue-500 text-white' },
      offline: { label: 'غير متاح', variant: 'outline' as const, className: 'bg-gray-500 text-white' },
    };
    return statusMap[technician.status] || statusMap.offline;
  };

  const statusBadge = getStatusBadge();

  return (
    <Card className="w-96 shadow-2xl bg-gradient-to-br from-primary/5 via-background to-primary/10 border-2 border-primary/30 animate-in slide-in-from-bottom-4">
      <CardHeader className="space-y-3 pb-4 bg-gradient-to-r from-primary/10 to-transparent">
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-3 flex-1">
            <Avatar className="h-16 w-16 border-2 border-primary/50">
              <AvatarImage src={technician.profile_image || undefined} alt={technician.name} />
              <AvatarFallback className="bg-primary/20 text-primary font-bold text-lg">
                {technician.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <CardTitle className="text-xl text-primary flex items-center gap-2">
                {technician.name}
                {technician.is_verified && (
                  <Award className="h-5 w-5 text-blue-500 fill-blue-500" />
                )}
              </CardTitle>
              {specializationNameAr && (
                <p className="text-sm text-muted-foreground mt-1">{specializationNameAr}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-yellow-500/20 px-3 py-1.5 rounded-full">
            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            <span className="text-sm font-bold">{technician.rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({technician.total_reviews} تقييم)</span>
          </div>
          
          <Badge className={statusBadge.className}>
            {statusBadge.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* Bio */}
        {technician.bio && (
          <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 p-3 rounded-lg">
            {technician.bio}
          </p>
        )}

        {/* معلومات الخدمة */}
        <div className="grid grid-cols-2 gap-3">
          {technician.hourly_rate && (
            <div className="flex items-center gap-2 text-sm bg-primary/5 p-2 rounded">
              <DollarSign className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">السعر/ساعة</p>
                <p className="font-semibold">{technician.hourly_rate} ج.م</p>
              </div>
            </div>
          )}
          
          {technician.available_from && technician.available_to && (
            <div className="flex items-center gap-2 text-sm bg-primary/5 p-2 rounded">
              <Clock className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">ساعات العمل</p>
                <p className="font-semibold text-xs">
                  {technician.available_from.substring(0, 5)} - {technician.available_to.substring(0, 5)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* معلومات الاتصال */}
        <div className="space-y-2 border-t pt-3">
          {technician.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-primary" />
              <a href={`tel:${technician.phone}`} className="hover:underline text-foreground font-medium">
                {technician.phone}
              </a>
            </div>
          )}
          
          {technician.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-primary" />
              <a href={`mailto:${technician.email}`} className="hover:underline truncate text-foreground">
                {technician.email}
              </a>
            </div>
          )}

          {technician.service_area_radius && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">
                نطاق الخدمة: {technician.service_area_radius} كم
              </span>
            </div>
          )}
        </div>

        {/* أزرار الإجراءات */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={() => onRequestService(technician.id)}
            className="flex-1 bg-primary hover:bg-primary/90 shadow-lg"
            size="lg"
            disabled={technician.status === 'offline'}
          >
            <Phone className="h-4 w-4 mr-2" />
            طلب خدمة فورية
          </Button>
          <Button 
            onClick={onClose}
            variant="outline"
            size="lg"
          >
            إغلاق
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
