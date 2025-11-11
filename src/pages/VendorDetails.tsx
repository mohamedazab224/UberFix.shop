import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Star, MapPin, Phone, Mail, Award, Clock, Shield, Briefcase } from "lucide-react";
import { VendorReviews } from "@/components/vendors/VendorReviews";
import { VendorTasks } from "@/components/vendors/VendorTasks";
import { VendorLocationTracker } from "@/components/vendors/VendorLocationTracker";
import { toast } from "@/hooks/use-toast";

interface Vendor {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company_name: string | null;
  specialization: string[] | null;
  address: string | null;
  rating: number | null;
  status: string | null;
  unit_rate: number | null;
  experience_years: number | null;
  profile_image: string | null;
  total_jobs: number | null;
  current_latitude: number | null;
  current_longitude: number | null;
  is_tracking_enabled: boolean | null;
  created_at: string;
}

const VendorDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchVendorDetails();
    }
  }, [id]);

  const fetchVendorDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setVendor(data);
    } catch (error) {
      console.error("Error fetching vendor:", error);
      toast({
        title: "خطأ",
        description: "فشل تحميل بيانات الفني",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg text-muted-foreground">لم يتم العثور على الفني</p>
            <Button onClick={() => navigate("/vendors")} className="mt-4">
              العودة للقائمة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig = {
    available: { label: "متاح", className: "bg-green-600 text-primary-foreground" },
    busy: { label: "مشغول", className: "bg-yellow-600 text-primary-foreground" },
    offline: { label: "غير متاح", className: "bg-muted text-muted-foreground" }
  };

  const currentStatus = vendor.status && vendor.status in statusConfig ? vendor.status : "available";

  return (
    <div className="container mx-auto px-4 py-8 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/vendors")}>
          <ArrowRight className="h-4 w-4 ml-2" />
          العودة
        </Button>
      </div>

      {/* Vendor Info Card */}
      <Card className="card-elegant">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar & Basic Info */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={vendor.profile_image || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                  {vendor.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Badge className={statusConfig[currentStatus as keyof typeof statusConfig].className}>
                {statusConfig[currentStatus as keyof typeof statusConfig].label}
              </Badge>
            </div>

            {/* Details */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold">{vendor.name}</h1>
                  <Shield className="h-6 w-6 text-green-500" />
                </div>
                {vendor.company_name && (
                  <p className="text-lg text-muted-foreground">{vendor.company_name}</p>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">التقييم</p>
                    <p className="text-lg font-semibold">{vendor.rating || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">المهام المنجزة</p>
                    <p className="text-lg font-semibold">{vendor.total_jobs || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">سنوات الخبرة</p>
                    <p className="text-lg font-semibold">{vendor.experience_years || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">سعر الساعة</p>
                    <p className="text-lg font-semibold">{vendor.unit_rate || 0} ج.م</p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                {vendor.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{vendor.phone}</span>
                  </div>
                )}
                {vendor.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{vendor.email}</span>
                  </div>
                )}
                {vendor.address && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{vendor.address}</span>
                  </div>
                )}
              </div>

              {/* Specializations */}
              {vendor.specialization && vendor.specialization.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">التخصصات:</p>
                  <div className="flex flex-wrap gap-2">
                    {vendor.specialization.map((spec, index) => (
                      <Badge key={index} variant="secondary">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="reviews" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reviews">التقييمات</TabsTrigger>
          <TabsTrigger value="tasks">المهام المنجزة</TabsTrigger>
          <TabsTrigger value="location">تتبع الموقع</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews">
          <VendorReviews vendorId={vendor.id} />
        </TabsContent>

        <TabsContent value="tasks">
          <VendorTasks vendorId={vendor.id} />
        </TabsContent>

        <TabsContent value="location">
          <VendorLocationTracker 
            vendorId={vendor.id}
            currentLatitude={vendor.current_latitude}
            currentLongitude={vendor.current_longitude}
            isTrackingEnabled={vendor.is_tracking_enabled || false}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorDetails;
