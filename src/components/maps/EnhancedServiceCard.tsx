import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Phone, Navigation, DollarSign, X, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TechnicianReviews } from "@/components/reviews/TechnicianReviews";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface EnhancedServiceCardProps {
  technicianId: string;
  name: string;
  specialization: string;
  rating: number;
  totalReviews: number;
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
  totalReviews,
  status,
  hourlyRate = 0,
  phone = '',
  distance = null,
  onClose
}: EnhancedServiceCardProps) {
  const navigate = useNavigate();
  const [showReviews, setShowReviews] = useState(false);

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

        {/* Status Badge */}
        <Badge 
          variant={status === 'available' ? 'default' : 'secondary'}
          className="font-medium w-fit"
        >
          {status === 'available' ? '✓ متاح الآن' : '⏳ مشغول'}
        </Badge>

        {/* Rating Section */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
            <span className="text-xl font-bold">{rating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">
              ({totalReviews} تقييم)
            </span>
          </div>
          {distance && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Navigation className="h-4 w-4" />
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

        <Separator />

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => setShowReviews(true)}
          >
            <MessageSquare className="h-4 w-4" />
            التقييمات
          </Button>
          <Button 
            className="flex-1 font-bold"
            onClick={handleRequestService}
            disabled={status !== 'available'}
          >
            اطلب الخدمة
          </Button>
        </div>
      </div>

      {/* Reviews Dialog */}
      <Dialog open={showReviews} onOpenChange={setShowReviews}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>تقييمات {name}</DialogTitle>
          </DialogHeader>
          <TechnicianReviews
            technicianId={technicianId}
            technicianName={name}
            rating={rating}
            totalReviews={totalReviews}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
