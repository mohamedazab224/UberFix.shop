import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Phone, Loader2, Building2, Plus } from "lucide-react";
import { useMaintenanceRequests } from "@/hooks/useMaintenanceRequests";
import { useToast } from "@/hooks/use-toast";
import { LocationPicker } from "@/components/forms/LocationPicker";
import { supabase } from "@/integrations/supabase/client";
import { useRequestLifecycle } from "@/hooks/useRequestLifecycle";
import { useProperties } from "@/hooks/useProperties";
import { PropertyForm } from "./PropertyForm";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface NewRequestFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function NewRequestForm({ onSuccess, onCancel }: NewRequestFormProps) {
  const { createRequest } = useMaintenanceRequests();
  const { addLifecycleEvent } = useRequestLifecycle();
  const { properties, loading: propertiesLoading } = useProperties();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    client_name: "",
    client_phone: "",
    location: "",
    service_type: "general",
    priority: "medium",
    preferred_date: "",
    preferred_time: "",
    latitude: null as number | null,
    longitude: null as number | null,
    property_id: "" as string
  });
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // التحقق من وجود عقارات عند تحميل المكون
  useEffect(() => {
    if (!propertiesLoading && properties.length === 0) {
      setShowPropertyForm(true);
    }
  }, [propertiesLoading, properties]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من صحة البيانات
    if (!formData.title.trim()) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال عنوان الطلب",
        variant: "destructive",
      });
      return;
    }

    if (!formData.client_name.trim()) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال اسم العميل",
        variant: "destructive",
      });
      return;
    }

    if (!formData.client_phone.trim()) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال رقم الهاتف",
        variant: "destructive",
      });
      return;
    }

    // التحقق من صحة رقم الهاتف (11 رقم يبدأ ب 01)
    const phoneRegex = /^01[0-2,5]{1}[0-9]{8}$/;
    if (!phoneRegex.test(formData.client_phone)) {
      toast({
        title: "خطأ في رقم الهاتف",
        description: "يرجى إدخال رقم هاتف مصري صحيح (01xxxxxxxxx)",
        variant: "destructive",
      });
      return;
    }

    if (!formData.location.trim()) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال العنوان",
        variant: "destructive",
      });
      return;
    }

    if (!formData.property_id) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى اختيار العقار",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // التحقق من بيانات الشركة والفرع
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("يجب تسجيل الدخول أولاً");
      }

      // جلب بيانات المستخدم من profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profileData?.company_id) {
        throw new Error("لا يوجد شركة مرتبطة بحسابك. يرجى التواصل مع الإدارة.");
      }

      // جلب أول فرع للشركة
      const { data: branchData, error: branchError } = await supabase
        .from('branches')
        .select('id')
        .eq('company_id', profileData.company_id)
        .limit(1)
        .single();

      if (branchError || !branchData) {
        throw new Error("لا يوجد فروع لشركتك. يرجى إضافة فرع أولاً.");
      }

      // إعداد البيانات للإرسال مع company_id و branch_id المطلوبين
      const { 
        property_id, 
        preferred_date, 
        preferred_time,
        latitude,
        longitude,
        ...requestData 
      } = formData;
      
      const requestPayload = {
        ...requestData,
        company_id: profileData.company_id,
        branch_id: branchData.id,
        status: 'Open' as const
      };
      
      const result = await createRequest(requestPayload);
      if (result) {
        // إنشاء حدث دورة حياة للطلب الجديد
        try {
          await addLifecycleEvent(
            result.id,
            'submitted',
            'status_change',
            'تم إنشاء الطلب بنجاح',
            { 
              service_type: formData.service_type,
              priority: formData.priority,
              has_location: !!(formData.latitude && formData.longitude)
            }
          );

          // إنشاء إشعار للمستخدم
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('notifications').insert({
              recipient_id: user.id,
              title: 'تم استلام طلبك',
              message: `تم استلام طلب الصيانة: ${formData.title}`,
              type: 'success',
              entity_type: 'maintenance_request',
              entity_id: result.id
            });
          }
        } catch (lifecycleError) {
          console.error('Error creating lifecycle event:', lifecycleError);
        }

        toast({
          title: "تم إرسال الطلب بنجاح",
          description: "سيتم التواصل معك قريباً",
        });

        // إرسال إشعار لأقرب فني إذا تم تحديد الموقع
        if (formData.latitude && formData.longitude) {
          try {
            const { data: notificationResult, error: notificationError } = await supabase.functions.invoke('send-notification', {
              body: {
                maintenanceRequestId: result.id,
                latitude: formData.latitude,
                longitude: formData.longitude,
                serviceType: formData.service_type,
                clientName: formData.client_name,
                address: formData.location
              }
            });

            if (notificationError) {
              console.error('Notification error:', notificationError);
              toast({
                title: "تحذير",
                description: "تم إنشاء الطلب لكن فشل في إرسال الإشعارات للفنيين",
                variant: "destructive",
              });
            } else if (notificationResult?.vendor) {
              toast({
                title: "تم تعيين فني",
                description: `تم تعيين ${notificationResult.vendor.name} للطلب (${notificationResult.vendor.distance?.toFixed(1)} كم)`,
              });
            }
          } catch (notificationError) {
            console.error('Error sending notification:', notificationError);
            toast({
              title: "تحذير", 
              description: "تم إنشاء الطلب لكن لا يوجد فنيين متاحين في المنطقة",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "ملاحظة",
            description: "لم يتم تحديد موقع - سيتم تعيين فني يدوياً",
          });
        }

        // حفظ معرف الطلب قبل مسح البيانات
        const requestId = result.id;
        
        setFormData({
          title: "",
          description: "",
          client_name: "",
          client_phone: "",
          location: "",
          service_type: "general",
          priority: "medium",
          preferred_date: "",
          preferred_time: "",
          latitude: null,
          longitude: null,
          property_id: ""
        });
        
        // إغلاق النموذج أولاً
        if (onSuccess) {
          onSuccess();
        }
        
        // ثم التوجيه لصفحة التفاصيل بعد ثانية واحدة
        setTimeout(() => {
          window.location.href = `/requests/${requestId}`;
        }, 500);
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast({
        title: "خطأ في إرسال الطلب",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocationSelect = (lat: number, lng: number, address?: string) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      location: address || prev.location
    }));
    setShowLocationPicker(false);
    toast({
      title: "تم تحديد الموقع",
      description: "تم حفظ موقعك بنجاح",
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePropertyAdded = () => {
    setShowPropertyForm(false);
    toast({
      title: "تم إضافة العقار بنجاح",
      description: "يمكنك الآن تقديم طلب الصيانة",
    });
  };

  // عرض نموذج إضافة عقار إذا لم يكن لدى المستخدم عقارات
  if (showPropertyForm) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-primary">إضافة عقار</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Building2 className="h-4 w-4" />
            <AlertDescription>
              يجب إضافة عقار أولاً قبل تقديم طلب الصيانة. يساعدنا ذلك في تقديم خدمة أفضل لك.
            </AlertDescription>
          </Alert>
          <PropertyForm 
            skipNavigation={true}
            onSuccess={() => {
              setShowPropertyForm(false);
              onCancel?.();
            }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-primary">طلب صيانة جديد</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Property Selection */}
          <div className="space-y-2">
            <Label htmlFor="property_id">العقار *</Label>
            <div className="flex gap-2">
              <Select 
                value={formData.property_id} 
                onValueChange={(value) => handleChange("property_id", value)}
                required
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="اختر العقار" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>{property.name} - {property.address}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>إضافة عقار جديد</DialogTitle>
                  </DialogHeader>
                  <PropertyForm 
                    skipNavigation={true}
                    onSuccess={() => {
                      toast({
                        title: "تم إضافة العقار بنجاح",
                      });
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان الطلب *</Label>
              <Input
                id="title"
                placeholder="مثال: إصلاح تسريب المياه"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف *</Label>
              <div className="relative">
                <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  placeholder="01xxxxxxxxx"
                  value={formData.client_phone}
                  onChange={(e) => handleChange("client_phone", e.target.value)}
                  className="pr-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_name">اسم العميل *</Label>
              <Input
                id="client_name"
                placeholder="اسم العميل"
                value={formData.client_name}
                onChange={(e) => handleChange("client_name", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">العنوان *</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="العنوان التفصيلي"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  className="pr-10"
                  required
                />
              </div>
              <Dialog open={showLocationPicker} onOpenChange={setShowLocationPicker}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" size="icon">
                    <MapPin className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>تحديد الموقع على الخريطة</DialogTitle>
                  </DialogHeader>
                  <LocationPicker 
                    onLocationSelect={handleLocationSelect}
                    initialLatitude={formData.latitude || undefined}
                    initialLongitude={formData.longitude || undefined}
                    initialAddress={formData.location}
                  />
                </DialogContent>
              </Dialog>
            </div>
            {formData.latitude && formData.longitude && (
              <p className="text-sm text-green-600">
                ✓ تم تحديد الموقع على الخريطة
              </p>
            )}
          </div>


          {/* Service Details */}
          <div className="space-y-2">
            <Label htmlFor="service_type">نوع الخدمة *</Label>
            <Select value={formData.service_type} onValueChange={(value) => handleChange("service_type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع الخدمة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plumbing">سباكة</SelectItem>
                <SelectItem value="electrical">كهرباء</SelectItem>
                <SelectItem value="hvac">تكييف</SelectItem>
                <SelectItem value="carpentry">نجارة</SelectItem>
                <SelectItem value="painting">دهانات</SelectItem>
                <SelectItem value="cleaning">تنظيف</SelectItem>
                <SelectItem value="general">صيانة عامة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">وصف المشكلة *</Label>
            <Textarea
              id="description"
              placeholder="اشرح التفاصيل والمشكلة بوضوح..."
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* Priority & Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">الأولوية</Label>
              <Select value={formData.priority} onValueChange={(value) => handleChange("priority", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">منخفضة</SelectItem>
                  <SelectItem value="medium">متوسطة</SelectItem>
                  <SelectItem value="high">عالية</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferred_date">التاريخ المفضل</Label>
              <Input
                id="preferred_date"
                type="date"
                value={formData.preferred_date}
                onChange={(e) => handleChange("preferred_date", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferred_time">الوقت المفضل</Label>
              <Select value={formData.preferred_time} onValueChange={(value) => handleChange("preferred_time", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الوقت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">صباحاً (8-12)</SelectItem>
                  <SelectItem value="afternoon">ظهراً (12-4)</SelectItem>
                  <SelectItem value="evening">مساءً (4-8)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Priority Badge Preview */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">معاينة الأولوية:</span>
            <Badge className={
              formData.priority === "high" ? "bg-destructive text-destructive-foreground" :
              formData.priority === "medium" ? "bg-warning text-warning-foreground" :
              "bg-muted text-muted-foreground"
            }>
              {formData.priority === "high" ? "عالية" : 
               formData.priority === "medium" ? "متوسطة" : "منخفضة"}
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              إرسال الطلب
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={isSubmitting}>
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}