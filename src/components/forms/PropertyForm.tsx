import { useState } from "react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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

const propertySchema = z.object({
  name: z.string().min(3, "اسم العقار يجب أن يكون 3 أحرف على الأقل"),
  code: z.string().optional(),
  type: z.string()
    .refine(
      (val) => [
        "residential",
        "commercial",
        "industrial",
        "office",
        "retail",
        "mixed_use",
      ].includes(val),
      { message: "يرجى اختيار نوع العقار" }
    )
    .default("residential"),
  country_code: z.string().default("EG"),
  city_id: z.string().optional(),
  district_id: z.string().optional(),
  address: z.string().optional(),
  area: z.number().optional(),
  rooms: z.number().optional(),
  description: z.string().optional(),
  maintenance_manager: z.string().optional(),
  property_supervisor: z.string().optional(),
  temp_contact_name: z.string().optional(),
  temp_contact_country_code: z.string().optional(),
  temp_contact_phone: z.string().optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

interface PropertyFormProps {
  skipNavigation?: boolean;
  onSuccess?: () => void;
}

export function PropertyForm({ skipNavigation = false, onSuccess }: PropertyFormProps = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const [images, setImages] = useState<File[]>([]);
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
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      type: "residential",
      country_code: "EG",
      temp_contact_country_code: "+20"
    }
  });

  const propertyType = watch("type");

  // Fetch cities (level 1 regions)
  React.useEffect(() => {
    const fetchCities = async () => {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .eq('level', 1)
        .eq('is_active', true)
        .order('name');

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
        .from('regions')
        .select('*')
        .eq('parent_id', selectedCity)
        .eq('is_active', true)
        .order('name');

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
        throw new Error("يجب تسجيل الدخول أولاً");
      }

      // إنشاء العقار مع حفظ إحداثيات الخريطة (بدون region_id لأنه غير موجود في الجدول)
      const { error: insertError } = await supabase
        .from("properties")
        .insert([{
          name: data.name,
          type: data.type,
          address: data.address || location?.address || '',
          area: data.area || null,
          rooms: data.rooms || null,
          description: data.description || null,
          latitude: location?.latitude || null,
          longitude: location?.longitude || null,
          status: "active",
          manager_id: user.id,
        }]);

      if (insertError) throw insertError;

      toast({
        title: "تم بنجاح",
        description: "تم إضافة العقار بنجاح",
      });

      if (onSuccess) {
        onSuccess();
      } else if (!skipNavigation) {
        navigate("/properties");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إضافة العقار",
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

      {/* اسم ورقم العقار */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="space-y-2">
          <Label htmlFor="code">رقم/رمز العقار</Label>
          <Input
            id="code"
            {...register("code")}
            placeholder="مثال: B-101"
          />
        </div>
      </div>

      {/* صورة العقار */}
      <div className="space-y-2">
        <Label>صورة العقار</Label>
        <ImageUpload
          images={images}
          onImagesChange={setImages}
          maxImages={5}
        />
      </div>

      {/* تفاصيل الموقع */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">تفاصيل الموقع</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>الدولة</Label>
            <Select
              defaultValue="EG"
              onValueChange={(value) => setValue("country_code", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EG">جمهورية مصر العربية</SelectItem>
                <SelectItem value="SA">المملكة العربية السعودية</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>المدينة</Label>
            <Select
              value={selectedCity}
              onValueChange={(value) => {
                setSelectedCity(value);
                setValue("city_id", value);
                setValue("district_id", "");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر المدينة التي يقع بها العقار" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>الحي</Label>
            <Select
              disabled={!selectedCity}
              onValueChange={(value) => setValue("district_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الحي الذي يقع به العقار" />
              </SelectTrigger>
              <SelectContent>
                {districts.map((district) => (
                  <SelectItem key={district.id} value={district.id}>
                    {district.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
        <Label htmlFor="address">العنوان التفصيلي (اختياري)</Label>
        <Textarea
          id="address"
          {...register("address")}
          placeholder="نادي وادي دجلة أكتوبر"
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          تفاصيل إضافية للعنوان: مثل رقم الطابق، الطريق بعد الرقم الأساسي، رقم الشقة، إلخ
        </p>
      </div>

      {/* المواصفات الأساسية */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">المواصفات الأساسية</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="area">المساحة (متر مربع)</Label>
            <Input
              id="area"
              type="number"
              step="0.01"
              min="0"
              {...register("area", { 
                setValueAs: v => v === '' ? undefined : parseFloat(v)
              })}
              placeholder="مثال: 50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rooms">عدد الغرف</Label>
            <Input
              id="rooms"
              type="number"
              min="0"
              {...register("rooms", { 
                setValueAs: v => v === '' ? undefined : parseInt(v)
              })}
              placeholder="مثال: 2"
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

      {/* إعدادات الإدارة */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">إعدادات الإدارة</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="maintenance_manager">مدير الصيانة</Label>
            <Input
              id="maintenance_manager"
              {...register("maintenance_manager")}
              placeholder="اسم مدير الصيانة (اختياري)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="property_supervisor">مشرف العقار</Label>
            <Input
              id="property_supervisor"
              {...register("property_supervisor")}
              placeholder="اسم مشرف العقار (اختياري)"
            />
          </div>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg space-y-4">
          <p className="text-sm text-muted-foreground">
            هذه الحقول اختيارية وتُستخدم فقط إذا كنت ترغب بعرض بيانات تواصل مؤقتة للطلبات.
          </p>

          <div className="space-y-2">
            <Label htmlFor="temp_contact_name">اسم الشخص للتواصل المؤقت</Label>
            <Input
              id="temp_contact_name"
              {...register("temp_contact_name")}
              placeholder="ادخل الاسم..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="temp_contact_country_code">رمز الدولة</Label>
              <Select
                defaultValue="+20"
                onValueChange={(value) => setValue("temp_contact_country_code", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="+20">+20 (مصر)</SelectItem>
                  <SelectItem value="+966">+966 (السعودية)</SelectItem>
                  <SelectItem value="+971">+971 (الإمارات)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="temp_contact_phone">رقم الجوال للتواصل المؤقت</Label>
              <Input
                id="temp_contact_phone"
                {...register("temp_contact_phone")}
                placeholder="مثال: 1234567890"
                type="tel"
              />
            </div>
          </div>
        </div>
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
