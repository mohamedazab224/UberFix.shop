import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowRight, 
  Edit, 
  MapPin, 
  Home, 
  Bed, 
  Bath, 
  Maximize, 
  Calendar,
  QrCode,
  Image as ImageIcon,
  Wrench,
  TrendingUp,
  Building2
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PropertyQRCode } from "@/components/properties/PropertyQRCode";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<number>(0);

  // Fetch property details
  const { data: property, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select(`
          *,
          cities (name_ar),
          districts (name_ar)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch maintenance requests statistics
  const { data: stats } = useQuery({
    queryKey: ["property-stats", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select("status")
        .eq("property_id", id);

      if (error) throw error;

      return {
        total: data.length,
        open: data.filter(r => r.status === "Open").length,
        inProgress: data.filter(r => r.status === "InProgress").length,
        completed: data.filter(r => r.status === "Completed").length,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">العقار غير موجود</p>
            <Button onClick={() => navigate("/properties")} className="mt-4">
              العودة إلى القائمة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const typeConfig = {
    commercial: { label: "تجاري", className: "bg-blue-500" },
    residential: { label: "سكني", className: "bg-green-500" },
    industrial: { label: "صناعي", className: "bg-orange-500" },
    office: { label: "مكتبي", className: "bg-purple-500" },
    retail: { label: "تجزئة", className: "bg-teal-500" }
  };

  const statusConfig = {
    active: { label: "نشط", className: "bg-green-500" },
    maintenance: { label: "تحت الصيانة", className: "bg-yellow-500" },
    inactive: { label: "غير نشط", className: "bg-gray-500" }
  };

  const images = property.images || [];
  const has3DModel = property.code; // استخدام الكود كمؤشر لوجود نموذج 3D

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/properties")}
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              {property.icon_url && (
                <img 
                  src={property.icon_url} 
                  alt="" 
                  className="h-8 w-8"
                />
              )}
              <h1 className="text-3xl font-bold">{property.name}</h1>
            </div>
            <p className="text-muted-foreground mt-1">
              {typeConfig[property.type as keyof typeof typeConfig]?.label || property.type}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/properties/edit/${id}`)}
          >
            <Edit className="h-4 w-4 ml-2" />
            تعديل العقار
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <Wrench className="h-4 w-4 ml-2" />
            طلب صيانة جديد
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Right Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery & 3D Model Tabs */}
          <Card>
            <CardContent className="p-0">
              <Tabs defaultValue={images.length > 0 ? "gallery" : "3d"} className="w-full">
                <div className="border-b">
                  <TabsList className="w-full justify-start rounded-none h-12 bg-transparent p-0">
                    {images.length > 0 && (
                      <TabsTrigger 
                        value="gallery" 
                        className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                      >
                        <ImageIcon className="h-4 w-4 ml-2" />
                        معرض الصور ({images.length})
                      </TabsTrigger>
                    )}
                    {has3DModel && (
                      <TabsTrigger 
                        value="3d"
                        className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                      >
                        <Building2 className="h-4 w-4 ml-2" />
                        النموذج ثلاثي الأبعاد
                      </TabsTrigger>
                    )}
                  </TabsList>
                </div>

                {/* Gallery Tab */}
                {images.length > 0 && (
                  <TabsContent value="gallery" className="p-4 space-y-4">
                    {/* Main Image */}
                    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                      <img
                        src={images[selectedImage]}
                        alt={`${property.name} - صورة ${selectedImage + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                        {selectedImage + 1} / {images.length}
                      </div>
                    </div>

                    {/* Thumbnails */}
                    {images.length > 1 && (
                      <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                        {images.map((img: string, index: number) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                              selectedImage === index
                                ? "border-primary"
                                : "border-transparent hover:border-muted-foreground/50"
                            }`}
                          >
                            <img
                              src={img}
                              alt={`صورة مصغرة ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                )}

                {/* 3D Model Tab */}
                {has3DModel && (
                  <TabsContent value="3d" className="p-4">
                    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                      <iframe
                        src={`https://3d.magicplan.app/#embed/?key=MTliOGVhNWRiNTkwMGZmYmUyYTlkYzc2MDZhNDViZGJlYjUyZjdjMWYwMWU4ZjVhYmJkN2NkOWRmM2Q2NmY5OJOymKZ%2BObYnwKOkntC%2BvU8IP57fd90iMReYHueTjkM%2B%2BZ4mH2Qqvcf4WO7k%2FAhzwg%3D%3D`}
                        className="w-full h-full"
                        allowFullScreen
                        style={{ border: 0 }}
                        title="نموذج ثلاثي الأبعاد للعقار"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 text-center">
                      استخدم الماوس للتحرك في النموذج ثلاثي الأبعاد
                    </p>
                  </TabsContent>
                )}

                {/* Empty State */}
                {images.length === 0 && !has3DModel && (
                  <div className="p-12 text-center">
                    <ImageIcon className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">لا توجد صور أو نماذج ثلاثية الأبعاد</p>
                  </div>
                )}
              </Tabs>
            </CardContent>
          </Card>

          {/* Property Information */}
          <Card>
            <CardHeader>
              <CardTitle>معلومات العقار</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Specifications */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {property.area && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="p-2 bg-primary/10 rounded">
                      <Maximize className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">المساحة</p>
                      <p className="font-semibold">{property.area} م²</p>
                    </div>
                  </div>
                )}
                
                {property.rooms && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="p-2 bg-primary/10 rounded">
                      <Bed className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">الغرف</p>
                      <p className="font-semibold">{property.rooms}</p>
                    </div>
                  </div>
                )}

                {property.bathrooms && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="p-2 bg-primary/10 rounded">
                      <Bath className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">الحمامات</p>
                      <p className="font-semibold">{property.bathrooms}</p>
                    </div>
                  </div>
                )}

                {property.floors && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="p-2 bg-primary/10 rounded">
                      <Home className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">الطوابق</p>
                      <p className="font-semibold">{property.floors}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  الموقع
                </h3>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">المدينة:</span> {property.cities?.name_ar}</p>
                  <p><span className="text-muted-foreground">الحي:</span> {property.districts?.name_ar}</p>
                  <p><span className="text-muted-foreground">العنوان:</span> {property.address}</p>
                </div>
              </div>

              {/* Description */}
              {property.description && (
                <div className="space-y-2">
                  <h3 className="font-semibold">الوصف</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {property.description}
                  </p>
                </div>
              )}

              {/* Map */}
              {property.latitude && property.longitude && (
                <div className="space-y-2">
                  <h3 className="font-semibold">الموقع على الخريطة</h3>
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0 }}
                      src={`https://www.google.com/maps?q=${property.latitude},${property.longitude}&output=embed`}
                      allowFullScreen
                      title="موقع العقار"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Left Column - Sidebar */}
        <div className="space-y-6">
          {/* Quick Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">معلومات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">كود العقار</p>
                <p className="font-mono font-semibold text-lg">{property.code || 'غير محدد'}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">نوع العقار</p>
                <Badge className={`${typeConfig[property.type as keyof typeof typeConfig]?.className} text-white`}>
                  {typeConfig[property.type as keyof typeof typeConfig]?.label || property.type}
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">الحالة</p>
                <Badge className={`${statusConfig[property.status as keyof typeof statusConfig]?.className} text-white`}>
                  {statusConfig[property.status as keyof typeof statusConfig]?.label || property.status}
                </Badge>
              </div>

              {property.created_at && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">تاريخ الإضافة</p>
                  <p className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(property.created_at).toLocaleDateString('ar-EG')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                إحصائيات الصيانة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">إجمالي الطلبات</span>
                <span className="font-semibold text-lg">{stats?.total || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">مفتوحة</span>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                  {stats?.open || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">قيد التنفيذ</span>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                  {stats?.inProgress || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">مكتملة</span>
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                  {stats?.completed || 0}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* QR Code Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                رمز الاستجابة السريعة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PropertyQRCode propertyId={property.id} propertyName={property.name} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
