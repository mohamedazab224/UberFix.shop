import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { MapPin, Phone, Loader2, Building2, Plus } from "lucide-react";
import { useMaintenanceRequests } from "@/hooks/useMaintenanceRequests";
import { useToast } from "@/hooks/use-toast";
import { LocationPicker } from "@/components/forms/LocationPicker";
import { supabase } from "@/integrations/supabase/client";
import { useRequestLifecycle } from "@/hooks/useRequestLifecycle";
import { useProperties } from "@/hooks/useProperties";
import { PropertyForm } from "./PropertyForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { maintenanceRequestFormSchema } from "@/lib/validationSchemas";

interface NewRequestFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

type MaintenanceRequestFormData = z.infer<typeof maintenanceRequestFormSchema>;

export function NewRequestForm({ onSuccess, onCancel }: NewRequestFormProps) {
  const { createRequest } = useMaintenanceRequests();
  const { addLifecycleEvent } = useRequestLifecycle();
  const { properties, loading: propertiesLoading } = useProperties();
  const { toast } = useToast();
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const form = useForm<MaintenanceRequestFormData>({
    resolver: zodResolver(maintenanceRequestFormSchema),
    defaultValues: {
      title: "",
      description: "",
      client_name: "",
      client_phone: "",
      client_email: "",
      location: "",
      service_type: "general",
      priority: "medium",
      preferred_date: "",
      preferred_time: "",
      customer_notes: "",
      latitude: null,
      longitude: null,
      property_id: "",
    },
  });

  // التحقق من وجود عقارات عند تحميل المكون
  useEffect(() => {
    if (!propertiesLoading && properties.length === 0) {
      setShowPropertyForm(true);
    }
  }, [propertiesLoading, properties]);

  const handleSubmit = async (data: MaintenanceRequestFormData) => {
    try {
      // إعداد البيانات للإرسال - createRequest سيتعامل مع company_id و branch_id تلقائياً
      const requestPayload = {
        title: data.title,
        description: data.description,
        client_name: data.client_name,
        client_phone: data.client_phone,
        client_email: data.client_email || undefined,
        location: data.location,
        service_type: data.service_type,
        priority: data.priority,
        property_id: data.property_id || null,
        latitude: data.latitude,
        longitude: data.longitude,
        customer_notes: data.customer_notes || undefined,
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
              service_type: data.service_type,
              priority: data.priority,
              has_location: !!(data.latitude && data.longitude)
            }
          );

          // إنشاء إشعار للمستخدم
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('notifications').insert({
              recipient_id: user.id,
              title: 'تم استلام طلبك',
              message: `تم استلام طلب الصيانة: ${data.title}`,
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
        if (data.latitude && data.longitude) {
          try {
            const { data: notificationResult, error: notificationError } = await supabase.functions.invoke('send-notification', {
              body: {
                maintenanceRequestId: result.id,
                latitude: data.latitude,
                longitude: data.longitude,
                serviceType: data.service_type,
                clientName: data.client_name,
                address: data.location
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
        
        form.reset();
        
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
    }
  };

  const handleLocationSelect = (lat: number, lng: number, address?: string) => {
    form.setValue('latitude', lat);
    form.setValue('longitude', lng);
    if (address) {
      form.setValue('location', address);
    }
    setShowLocationPicker(false);
    toast({
      title: "تم تحديد الموقع",
      description: "تم حفظ موقعك بنجاح",
    });
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Property Selection */}
            <FormField
              control={form.control}
              name="property_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>العقار *</FormLabel>
                  <div className="flex gap-2">
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="اختر العقار" />
                        </SelectTrigger>
                      </FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عنوان الطلب *</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: إصلاح تسريب المياه" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="client_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الهاتف *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="01xxxxxxxxx" className="pr-10" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>رقم هاتف مصري (11 رقم)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="client_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم العميل *</FormLabel>
                    <FormControl>
                      <Input placeholder="اسم العميل" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="client_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="example@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>العنوان *</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <div className="relative flex-1">
                        <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="العنوان التفصيلي" className="pr-10" {...field} />
                      </div>
                    </FormControl>
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
                          initialLatitude={form.watch('latitude') || undefined}
                          initialLongitude={form.watch('longitude') || undefined}
                          initialAddress={field.value}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                  {form.watch('latitude') && form.watch('longitude') && (
                    <p className="text-sm text-green-600">
                      ✓ تم تحديد الموقع على الخريطة
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Service Details */}
            <FormField
              control={form.control}
              name="service_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع الخدمة *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع الخدمة" />
                      </SelectTrigger>
                    </FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>وصف المشكلة *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="اشرح التفاصيل والمشكلة بوضوح..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Priority & Schedule */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الأولوية</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">منخفضة</SelectItem>
                        <SelectItem value="medium">متوسطة</SelectItem>
                        <SelectItem value="high">عالية</SelectItem>
                        <SelectItem value="urgent">عاجلة</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferred_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>التاريخ المفضل</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferred_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الوقت المفضل</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الوقت" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="morning">صباحاً (8-12)</SelectItem>
                        <SelectItem value="afternoon">ظهراً (12-4)</SelectItem>
                        <SelectItem value="evening">مساءً (4-8)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="customer_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات إضافية</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="أي تفاصيل إضافية تريد إضافتها..."
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Priority Badge Preview */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">معاينة الأولوية:</span>
              <Badge className={
                form.watch('priority') === "urgent" || form.watch('priority') === "high" ? "bg-destructive text-destructive-foreground" :
                form.watch('priority') === "medium" ? "bg-warning text-warning-foreground" :
                "bg-muted text-muted-foreground"
              }>
                {form.watch('priority') === "urgent" ? "عاجلة" :
                 form.watch('priority') === "high" ? "عالية" : 
                 form.watch('priority') === "medium" ? "متوسطة" : "منخفضة"}
              </Badge>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                إرسال الطلب
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={form.formState.isSubmitting}>
                إلغاء
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}