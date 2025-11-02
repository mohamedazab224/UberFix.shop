import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useState, useEffect } from "react";
import { Loader2, Users, MapPin, Star, FileText } from "lucide-react";

export function TechniciansSettings() {
  const { settings, isLoading, updateSettings } = useAppSettings();
  const [formData, setFormData] = useState({
    show_technicians_on_map: true,
    enable_technician_rating: true,
    allow_technician_quotes: true,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        show_technicians_on_map: settings.show_technicians_on_map,
        enable_technician_rating: settings.enable_technician_rating,
        allow_technician_quotes: settings.allow_technician_quotes,
      });
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          إعدادات الفنيين والعملاء
        </CardTitle>
        <CardDescription>التحكم في ظهور الفنيين والتفاعل مع العملاء</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Show on Map */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20">
          <div className="space-y-0.5">
            <Label htmlFor="show_map" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              إظهار الفنيين على الخريطة
            </Label>
            <p className="text-sm text-muted-foreground">
              عرض مواقع الفنيين المتاحين على خريطة الخدمات
            </p>
          </div>
          <Switch
            id="show_map"
            checked={formData.show_technicians_on_map}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, show_technicians_on_map: checked })
            }
          />
        </div>

        {/* Enable Rating */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20">
          <div className="space-y-0.5">
            <Label htmlFor="enable_rating" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              تفعيل تقييم الفنيين
            </Label>
            <p className="text-sm text-muted-foreground">
              السماح للعملاء بتقييم الفنيين بعد إتمام الخدمة
            </p>
          </div>
          <Switch
            id="enable_rating"
            checked={formData.enable_technician_rating}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, enable_technician_rating: checked })
            }
          />
        </div>

        {/* Allow Quotes */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20">
          <div className="space-y-0.5">
            <Label htmlFor="allow_quotes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              السماح بعروض الأسعار
            </Label>
            <p className="text-sm text-muted-foreground">
              تمكين الفنيين من إرسال عروض أسعار مباشرة للعملاء
            </p>
          </div>
          <Switch
            id="allow_quotes"
            checked={formData.allow_technician_quotes}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, allow_technician_quotes: checked })
            }
          />
        </div>

        {/* Technician Statuses */}
        <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="font-medium mb-2">حالات الفني المتاحة</h4>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">متاح</span>
            <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm">مشغول</span>
            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">غير متصل</span>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} className="bg-gradient-primary">
            حفظ التغييرات
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
