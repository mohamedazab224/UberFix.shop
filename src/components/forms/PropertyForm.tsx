import { useState } from "react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LocationPicker } from "./LocationPicker";
import { ImageUpload } from "./ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { propertyFormSchema } from "@/lib/validationSchemas";
import { getPropertyIcon } from "@/lib/propertyIcons";
import type { z } from "zod";

type PropertyFormData = z.infer<typeof propertyFormSchema>;

interface PropertyFormProps {
  skipNavigation?: boolean;
  onSuccess?: () => void;
  initialData?: any;
  propertyId?: string;
}

export function PropertyForm({ skipNavigation = false, onSuccess, initialData, propertyId }: PropertyFormProps = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const [propertyImages, setPropertyImages] = useState<File[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");

  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      type: "residential",
      address: "",
      name: "",
      code: "",
      city_id: "",
      district_id: ""
    },
    mode: "onChange"
  });

  const propertyType = watch("type");

  // Load initial data for editing
  React.useEffect(() => {
    if (initialData) {
      reset({
        type: initialData.type || "residential",
        code: initialData.code || "",
        name: initialData.name || "",
        address: initialData.address || "",
        city_id: initialData.city_id?.toString() || "",
        district_id: initialData.district_id?.toString() || "",
        area: initialData.area,
        rooms: initialData.rooms,
        bathrooms: initialData.bathrooms,
        floors: initialData.floors,
        description: initialData.description,
      });
      
      if (initialData.city_id) {
        setSelectedCity(initialData.city_id.toString());
      }
      
      if (initialData.latitude && initialData.longitude) {
        setLocation({
          latitude: initialData.latitude,
          longitude: initialData.longitude,
          address: initialData.address,
        });
      }
    }
  }, [initialData, reset]);

  // Fetch cities
  React.useEffect(() => {
    const fetchCities = async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .order('name_ar');

      if (!error && data) {
        setCities(data);
      }
    };
    fetchCities();
  }, []);

  // Fetch districts when city changes
  React.useEffect(() => {
    const fetchDistricts = async () => {
      if (!selectedCity) {
        setDistricts([]);
        return;
      }

      const { data, error } = await supabase
        .from('districts')
        .select('*')
        .eq('city_id', parseInt(selectedCity))
        .order('name_ar');

      if (!error && data) {
        setDistricts(data);
      }
    };
    fetchDistricts();
  }, [selectedCity]);

  const onSubmit = async (data: PropertyFormData) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "يجب تسجيل الدخول أولاً",
        });
        return;
      }

      // Get auto-generated icon based on property type
      const iconUrl = getPropertyIcon(data.type);

      // Generate QR code URL
      const qrCodeData = `${window.location.origin}/quick-request/property-${data.code}`;

      // Upload images if any
      let imageUrls: string[] = [];
      if (propertyImages.length > 0) {
        const uploadPromises = propertyImages.map(async (file, index) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${data.code}_${index}_${Date.now()}.${fileExt}`;
          const filePath = `properties/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('property-images')
            .upload(filePath, file);

          if (uploadError) {
            console.error('Upload error:', uploadError);
            return null;
          }

          const { data: urlData } = supabase.storage
            .from('property-images')
            .getPublicUrl(filePath);

          return urlData.publicUrl;
        });

        const results = await Promise.all(uploadPromises);
        imageUrls = results.filter((url): url is string => url !== null);
      }

      // Check if this is an update or insert
      if (propertyId) {
        // Update existing property
        const updateData: any = {
          name: data.name.trim(),
          code: data.code.trim(),
          type: data.type,
          address: data.address.trim(),
          city_id: parseInt(data.city_id),
          district_id: parseInt(data.district_id),
          area: data.area || null,
          rooms: data.rooms || null,
          bathrooms: data.bathrooms || null,
          floors: data.floors || null,
          description: data.description?.trim() || null,
          latitude: location?.latitude || null,
          longitude: location?.longitude || null,
          icon_url: iconUrl,
          updated_at: new Date().toISOString(),
        };

        // Only update images if new ones were uploaded
        if (imageUrls.length > 0) {
          updateData.images = imageUrls;
        }

        const { error: updateError } = await supabase
          .from("properties")
          .update(updateData)
          .eq("id", propertyId);

        if (updateError) {
          console.error("Update error:", updateError);
          throw new Error(updateError.message || "حدث خطأ أثناء تحديث العقار");
        }

        toast({
          title: "تم بنجاح ✓",
          description: "تم تحديث العقار بنجاح",
        });
      } else {
        // Insert new property
        const { error: insertError } = await supabase
          .from("properties")
          .insert([{
            code: data.code.trim(),
            name: data.name.trim(),
            type: data.type,
            city_id: parseInt(data.city_id),
            district_id: parseInt(data.district_id),
            address: data.address.trim(),
            area: data.area || null,
            rooms: data.rooms || null,
            bathrooms: data.bathrooms || null,
            floors: data.floors || null,
            description: data.description?.trim() || null,
            latitude: location?.latitude || null,
            longitude: location?.longitude || null,
            icon_url: iconUrl,
            images: imageUrls.length > 0 ? imageUrls : null,
            qr_code_data: qrCodeData,
            qr_code_generated_at: new Date().toISOString(),
            status: "active",
            manager_id: user.id,
          }]);

        if (insertError) {
          console.error("Insert error:", insertError);
          throw new Error(insertError.message || "حدث خطأ أثناء إضافة العقار");
        }

        toast({
          title: "تم بنجاح ✓",
          description: "تم إضافة العقار بنجاح",
        });
      }

      if (onSuccess) {
        onSuccess();
      } else if (!skipNavigation) {
        navigate("/properties");
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      toast({
        variant: "destructive",
        title: "خطأ في الحفظ",
        description: error.message || "حدث خطأ أثناء حفظ العقار. يرجى المحاولة مرة أخرى",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setLocation({ latitude: lat, longitude: lng, address });
    setValue("address", address);
  };

  return (
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
              onClick={() => setValue("type", type.value as any)}
              className={`p-3 rounded-lg border-2 text-center transition-all ${propertyType === type.value
                ? "border-primary bg-primary/10 text-primary font-semibold"
                : "border-border hover:border-primary/50"
                }`}
            >
              {type.label}
            </button>
          ))}
        </div>
        {errors.type && (
          <p className="text-sm text-destructive">{errors.type.message}</p>
        )}
      </div>

      {/* كود واسم العقار */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code">كود العقار *</Label>
          <Input
            id="code"
            {...register("code")}
            placeholder="مثال: PROP-001"
            className={errors.code ? "border-destructive" : ""}
          />
          {errors.code && (
            <p className="text-sm text-destructive">{errors.code.message}</p>
          )}
        </div>

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
      </div>

      {/* صور العقار */}
      <div className="space-y-2">
        <Label>صور العقار</Label>
        <p className="text-sm text-muted-foreground mb-2">
          يمكنك إضافة صور للعقار (الصور تظهر في الواجهة الرئيسية، الأيقونة تستخدم للخرائط وبجانب اسم العقار)
        </p>
        <ImageUpload
          images={propertyImages}
          onImagesChange={setPropertyImages}
          maxImages={10}
        />
        <p className="text-xs text-muted-foreground">
          سيتم اختيار أيقونة العقار تلقائياً حسب نوع العقار
        </p>
      </div>

      {/* تفاصيل الموقع */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">تفاصيل الموقع</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">المدينة *</Label>
            <Select
              value={selectedCity}
              onValueChange={(value) => {
                setSelectedCity(value);
                setValue("city_id", value);
                setValue("district_id", ""); // Reset district when city changes
                setDistricts([]); // Clear districts
              }}
            >
              <SelectTrigger className={errors.city_id ? "border-destructive" : ""}>
                <SelectValue placeholder="اختر المدينة" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id.toString()}>
                    {city.name_ar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.city_id && (
              <p className="text-sm text-destructive">{errors.city_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="district">الحي *</Label>
            <Select
              value={watch("district_id")}
              onValueChange={(value) => setValue("district_id", value)}
              disabled={!selectedCity || districts.length === 0}
            >
              <SelectTrigger className={errors.district_id ? "border-destructive" : ""}>
                <SelectValue placeholder={selectedCity ? "اختر الحي" : "اختر المدينة أولاً"} />
              </SelectTrigger>
              <SelectContent>
                {districts.map((district) => (
                  <SelectItem key={district.id} value={district.id.toString()}>
                    {district.name_ar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.district_id && (
              <p className="text-sm text-destructive">{errors.district_id.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* إحداثيات الخريطة */}
      <div className="space-y-2">
        <Label>تحديد الموقع على الخريطة (اختياري)</Label>
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
          placeholder="نادي وادي دجلة أكتوبر"
          rows={3}
          className={errors.address ? "border-destructive" : ""}
        />
        {errors.address && (
          <p className="text-sm text-destructive">{errors.address.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          تفاصيل إضافية للعنوان: مثل رقم الطابق، الطريق، رقم الشقة، إلخ
        </p>
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
              min="0"
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
              min="0"
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
              min="0"
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
              min="0"
              {...register("floors", { 
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
        {!skipNavigation && (
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/properties")}
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            "حفظ البيانات"
          )}
        </Button>
      </div>
    </form>
  );
}
