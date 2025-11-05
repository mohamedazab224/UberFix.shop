import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LocationPicker } from "@/components/forms/LocationPicker";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";

const propertySchema = z.object({
  name: z.string().min(3, "اسم العقار يجب أن يكون 3 أحرف على الأقل"),
  type: z.string(),
  address: z.string().min(1, "العنوان مطلوب"),
  area: z.number().optional(),
  rooms: z.number().optional(),
  bathrooms: z.number().optional(),
  floors: z.number().optional(),
  parking_spaces: z.number().optional(),
  description: z.string().optional(),
  region_id: z.string().optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

export default function EditProperty() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
  });

  const propertyType = watch("type");

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        toast.error("فشل تحميل بيانات العقار");
        navigate("/properties");
        return;
      }

      if (data) {
        reset({
          name: data.name,
          type: data.type,
          address: data.address,
          area: data.area || undefined,
          rooms: data.rooms || undefined,
          bathrooms: data.bathrooms || undefined,
          floors: data.floors || undefined,
          parking_spaces: data.parking_spaces || undefined,
          description: data.description || undefined,
          region_id: data.region_id || undefined,
        });

        if (data.latitude && data.longitude) {
          setLocation({
            latitude: data.latitude,
            longitude: data.longitude,
            address: data.address,
          });
        }
      }

      setIsLoading(false);
    };

    fetchProperty();
  }, [id, reset, navigate]);

  const onSubmit = async (data: PropertyFormData) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("properties")
        .update({
          name: data.name.trim(),
          type: data.type,
          address: data.address.trim(),
          area: data.area || null,
          rooms: data.rooms || null,
          bathrooms: data.bathrooms || null,
          floors: data.floors || null,
          parking_spaces: data.parking_spaces || null,
          description: data.description?.trim() || null,
          region_id: data.region_id || null,
          latitude: location?.latitude || null,
          longitude: location?.longitude || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("تم تحديث العقار بنجاح");
      navigate("/properties");
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(error.message || "حدث خطأ أثناء تحديث العقار");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setLocation({ latitude: lat, longitude: lng, address });
    setValue("address", address);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/properties")}
          className="mb-4"
        >
          <ArrowRight className="h-4 w-4 ml-2" />
          الرجوع إلى القائمة
        </Button>
        
        <h1 className="text-3xl font-bold text-foreground">تعديل بيانات العقار</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>بيانات العقار</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* نوع العقار */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">نوع العقار *</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { value: "residential", label: "سكني" },
                  { value: "commercial", label: "تجاري" },
                  { value: "industrial", label: "صناعي" },
                  { value: "office", label: "مكتبي" },
                  { value: "retail", label: "تجزئة" },
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setValue("type", type.value)}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      propertyType === type.value
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* اسم العقار */}
            <div className="space-y-2">
              <Label htmlFor="name">اسم العقار *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="مثال: عمارة أكتوبر"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* إحداثيات الخريطة */}
            <div className="space-y-2">
              <Label>تحديد الموقع على الخريطة</Label>
              <LocationPicker
                onLocationSelect={handleLocationSelect}
                initialLatitude={location?.latitude}
                initialLongitude={location?.longitude}
                initialAddress={location?.address}
              />
            </div>

            {/* العنوان التفصيلي */}
            <div className="space-y-2">
              <Label htmlFor="address">العنوان التفصيلي *</Label>
              <Textarea
                id="address"
                {...register("address")}
                placeholder="أدخل العنوان التفصيلي"
                rows={3}
                className={errors.address ? "border-destructive" : ""}
              />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address.message}</p>
              )}
            </div>

            {/* المواصفات الأساسية */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">المواصفات الأساسية</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="area">المساحة (م²)</Label>
                  <Input
                    id="area"
                    type="number"
                    step="0.01"
                    {...register("area", { 
                      setValueAs: v => v === '' ? undefined : parseFloat(v)
                    })}
                    placeholder="50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rooms">الغرف</Label>
                  <Input
                    id="rooms"
                    type="number"
                    {...register("rooms", { 
                      setValueAs: v => v === '' ? undefined : parseInt(v)
                    })}
                    placeholder="2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">الحمامات</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    {...register("bathrooms", { 
                      setValueAs: v => v === '' ? undefined : parseInt(v)
                    })}
                    placeholder="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="floors">الطوابق</Label>
                  <Input
                    id="floors"
                    type="number"
                    {...register("floors", { 
                      setValueAs: v => v === '' ? undefined : parseInt(v)
                    })}
                    placeholder="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parking_spaces">المواقف</Label>
                  <Input
                    id="parking_spaces"
                    type="number"
                    {...register("parking_spaces", { 
                      setValueAs: v => v === '' ? undefined : parseInt(v)
                    })}
                    placeholder="1"
                  />
                </div>
              </div>
            </div>

            {/* الوصف */}
            <div className="space-y-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="أدخل وصفاً تفصيلياً للعقار..."
                rows={4}
              />
            </div>

            {/* أزرار الحفظ */}
            <div className="flex gap-3 justify-end pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/properties")}
                disabled={isSubmitting}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  "حفظ التعديلات"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
