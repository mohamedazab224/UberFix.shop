import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Phone, MapPin, Clock, Shield, Award, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface VendorCardProps {
  vendor: {
    id: string;
    name: string;
    specialty: string;
    rating: number;
    completedJobs: number;
    location: string;
    phone: string;
    status: "available" | "busy" | "offline";
    unitRate: string;
    avatar?: string;
    verified: boolean;
    responseTime: string;
  };
  onContact: (vendorId: string) => void;
  onAssign: (vendorId: string) => void;
}

export function VendorCard({ vendor, onContact, onAssign }: VendorCardProps) {
  const navigate = useNavigate();
  
  const statusConfig = {
    available: { label: "متاح", className: "bg-green-600 text-primary-foreground" },
    busy: { label: "مشغول", className: "bg-yellow-600 text-primary-foreground" },
    offline: { label: "غير متاح", className: "bg-muted text-muted-foreground" }
  };

  // Ensure we have a valid status with proper type checking
  const currentStatus: keyof typeof statusConfig = (vendor?.status && vendor.status in statusConfig) 
    ? vendor.status 
    : 'available';

  return (
    <Card className="card-elegant hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={vendor.avatar} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {vendor.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{vendor.name}</CardTitle>
                {vendor.verified && (
                  <Shield className="h-4 w-4 text-green-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">{vendor.specialty}</p>
            </div>
          </div>
          <Badge className={statusConfig[currentStatus].className}>
            {statusConfig[currentStatus].label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Rating & Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{vendor.rating}</span>
            <span className="text-muted-foreground">({vendor.completedJobs} مهمة)</span>
          </div>
          <div className="flex items-center gap-1 text-primary">
            <Award className="h-4 w-4" />
            <span>{vendor.unitRate}</span>
          </div>
        </div>

        {/* Location & Response Time */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{vendor.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>متوسط الاستجابة: {vendor.responseTime}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(`/vendors/${vendor.id}`)}
          >
            <Eye className="h-4 w-4 ml-2" />
            التفاصيل
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onContact(vendor.id)}
          >
            <Phone className="h-4 w-4 ml-2" />
            اتصال
          </Button>
          <Button 
            size="sm"
            onClick={() => onAssign(vendor.id)}
            disabled={currentStatus === "offline"}
          >
            تعيين
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}