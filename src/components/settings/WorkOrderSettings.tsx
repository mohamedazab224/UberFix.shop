import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useState, useEffect } from "react";
import { Loader2, ClipboardList, Clock, Shield } from "lucide-react";

export function WorkOrderSettings() {
  const { settings, isLoading, updateSettings } = useAppSettings();
  const [formData, setFormData] = useState({
    max_execution_time: 24,
    allow_edit_after_start: false,
    require_manager_approval: true,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        max_execution_time: settings.max_execution_time,
        allow_edit_after_start: settings.allow_edit_after_start,
        require_manager_approval: settings.require_manager_approval,
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
          <ClipboardList className="h-5 w-5 text-primary" />
          إعدادات طلبات الصيانة
        </CardTitle>
        <CardDescription>التحكم في سير العمل وقواعد الطلبات</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Max Execution Time */}
        <div className="space-y-2">
          <Label htmlFor="max_time" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            مدة التنفيذ القصوى (بالساعات)
          </Label>
          <Input
            id="max_time"
            type="number"
            min="1"
            value={formData.max_execution_time}
            onChange={(e) =>
              setFormData({ ...formData, max_execution_time: parseInt(e.target.value) })
            }
          />
          <p className="text-sm text-muted-foreground">
            الحد الأقصى للوقت المسموح به لإتمام الطلب
          </p>
        </div>

        {/* Allow Edit After Start */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20">
          <div className="space-y-0.5">
            <Label htmlFor="allow_edit">السماح بتعديل الطلب بعد البدء</Label>
            <p className="text-sm text-muted-foreground">
              إمكانية تعديل تفاصيل الطلب بعد بدء التنفيذ
            </p>
          </div>
          <Switch
            id="allow_edit"
            checked={formData.allow_edit_after_start}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, allow_edit_after_start: checked })
            }
          />
        </div>

        {/* Require Manager Approval */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20">
          <div className="space-y-0.5">
            <Label htmlFor="approval" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              تتطلب موافقة المدير
            </Label>
            <p className="text-sm text-muted-foreground">
              الطلبات تحتاج لموافقة المدير قبل الإرسال للفنيين
            </p>
          </div>
          <Switch
            id="approval"
            checked={formData.require_manager_approval}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, require_manager_approval: checked })
            }
          />
        </div>

        {/* Order Stages Info */}
        <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-primary" />
            مراحل الطلب الافتراضية
          </h4>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">جديد</span>
            <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm">قيد التنفيذ</span>
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">مكتمل</span>
            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">مغلق</span>
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
