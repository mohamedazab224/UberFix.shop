import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface NewVendorFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const NewVendorForm = ({ onClose, onSuccess }: NewVendorFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    company_name: "",
    specialization: [] as string[],
    phone: "",
    email: "",
    address: "",
    unit_rate: "",
    experience_years: "",
    notes: ""
  });
  
  const [certifications, setCertifications] = useState<string[]>([]);
  const [newCertification, setNewCertification] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const specialties = [
    "سباكة",
    "كهرباء",
    "تكييف وتبريد",
    "نجارة",
    "دهان",
    "بلاط وسيراميك",
    "عزل",
    "تنظيف",
    "أخرى"
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addCertification = () => {
    if (newCertification.trim() && !certifications.includes(newCertification.trim())) {
      setCertifications(prev => [...prev, newCertification.trim()]);
      setNewCertification("");
    }
  };

  const removeCertification = (cert: string) => {
    setCertifications(prev => prev.filter(c => c !== cert));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.specialization.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى ملء الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // جلب user_id لإنشاء profile أولاً
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("يجب تسجيل الدخول أولاً");
      }

      // إنشاء profile للمورد في جدول profiles أولاً
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          name: formData.name,
          email: formData.email || `vendor_${Date.now()}@temp.com`,
          role: 'technician',
          phone: formData.phone || null,
        }])
        .select()
        .single();

      if (profileError) throw profileError;

      // ثم إنشاء المورد في جدول vendors
      const { error } = await supabase
        .from('vendors')
        .insert([{
          id: profileData.id, // استخدام نفس id من profiles
          name: formData.name,
          company_name: formData.company_name || null,
          specialization: formData.specialization,
          phone: formData.phone || null,
          email: formData.email || null,
          address: formData.address || null,
          hourly_rate: formData.unit_rate ? parseFloat(formData.unit_rate) : null,
          experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
          status: 'active'
        }]);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم إضافة المورد الجديد بنجاح"
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error adding vendor:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في إضافة المورد",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold">إضافة مورد جديد</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">الاسم *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="اسم المورد"
                required
              />
            </div>
            <div>
              <Label htmlFor="company_name">اسم الشركة</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => handleInputChange("company_name", e.target.value)}
                placeholder="اسم الشركة (اختياري)"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="specialty">التخصص *</Label>
              <Select value={formData.specialization[0] || ""} onValueChange={(value) => setFormData(prev => ({ ...prev, specialization: [value] }))}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر التخصص" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="رقم الهاتف"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="البريد الإلكتروني"
              />
            </div>
            <div>
              <Label htmlFor="unit_rate">سعر الوحدة (جنيه)</Label>
              <Input
                id="unit_rate"
                type="number"
                value={formData.unit_rate}
                onChange={(e) => handleInputChange("unit_rate", e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">العنوان</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="العنوان الكامل"
            />
          </div>

          <div>
            <Label htmlFor="experience_years">سنوات الخبرة</Label>
            <Input
              id="experience_years"
              type="number"
              value={formData.experience_years}
              onChange={(e) => handleInputChange("experience_years", e.target.value)}
              placeholder="عدد سنوات الخبرة"
            />
          </div>

          <div>
            <Label>الشهادات والتراخيص</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                placeholder="أضف شهادة أو ترخيص"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
              />
              <Button type="button" onClick={addCertification} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {certifications.map((cert) => (
                <Badge key={cert} variant="secondary" className="px-2 py-1">
                  {cert}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => removeCertification(cert)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="ملاحظات إضافية"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "جاري الإضافة..." : "إضافة المورد"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};