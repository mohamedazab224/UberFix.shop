import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useState, useEffect } from "react";
import { Loader2, Shield, Lock, Clock, Database } from "lucide-react";

export function SecuritySettings() {
  const { settings, isLoading, updateSettings } = useAppSettings();
  const [formData, setFormData] = useState({
    enable_2fa: false,
    auto_backup_enabled: true,
    backup_frequency: "daily",
    lock_sensitive_settings: true,
    session_timeout: 30,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        enable_2fa: settings.enable_2fa,
        auto_backup_enabled: settings.auto_backup_enabled,
        backup_frequency: settings.backup_frequency,
        lock_sensitive_settings: settings.lock_sensitive_settings,
        session_timeout: settings.session_timeout,
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
          <Shield className="h-5 w-5 text-primary" />
          الأمان والنسخ الاحتياطي
        </CardTitle>
        <CardDescription>إعدادات الحماية والأمان والنسخ الاحتياطي</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Two-Factor Authentication */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20">
          <div className="space-y-0.5">
            <Label htmlFor="enable_2fa" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              المصادقة الثنائية (2FA)
            </Label>
            <p className="text-sm text-muted-foreground">
              تفعيل المصادقة بخطوتين للمديرين
            </p>
          </div>
          <Switch
            id="enable_2fa"
            checked={formData.enable_2fa}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, enable_2fa: checked })
            }
          />
        </div>

        {/* Auto Backup */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20">
            <div className="space-y-0.5">
              <Label htmlFor="auto_backup" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                النسخ الاحتياطي التلقائي
              </Label>
              <p className="text-sm text-muted-foreground">
                إنشاء نسخ احتياطية تلقائية للبيانات
              </p>
            </div>
            <Switch
              id="auto_backup"
              checked={formData.auto_backup_enabled}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, auto_backup_enabled: checked })
              }
            />
          </div>

          {formData.auto_backup_enabled && (
            <div className="space-y-2 pr-4">
              <Label htmlFor="backup_freq">تكرار النسخ الاحتياطي</Label>
              <Select
                value={formData.backup_frequency}
                onValueChange={(value) => setFormData({ ...formData, backup_frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">كل ساعة</SelectItem>
                  <SelectItem value="daily">يومياً</SelectItem>
                  <SelectItem value="weekly">أسبوعياً</SelectItem>
                  <SelectItem value="monthly">شهرياً</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Lock Sensitive Settings */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20">
          <div className="space-y-0.5">
            <Label htmlFor="lock_settings" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              قفل الإعدادات الحساسة
            </Label>
            <p className="text-sm text-muted-foreground">
              حماية الإعدادات الحساسة من التعديل غير المصرح
            </p>
          </div>
          <Switch
            id="lock_settings"
            checked={formData.lock_sensitive_settings}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, lock_sensitive_settings: checked })
            }
          />
        </div>

        {/* Session Timeout */}
        <div className="space-y-2">
          <Label htmlFor="session_timeout" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            مدة الجلسة (بالدقائق)
          </Label>
          <Input
            id="session_timeout"
            type="number"
            min="5"
            max="120"
            value={formData.session_timeout}
            onChange={(e) =>
              setFormData({ ...formData, session_timeout: parseInt(e.target.value) })
            }
          />
          <p className="text-sm text-muted-foreground">
            المدة قبل تسجيل الخروج التلقائي من الجلسة (5-120 دقيقة)
          </p>
        </div>

        {/* Security Info */}
        <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
          <h4 className="font-medium mb-2 text-destructive flex items-center gap-2">
            <Shield className="h-4 w-4" />
            ملاحظة أمنية هامة
          </h4>
          <p className="text-sm text-muted-foreground">
            يُنصح بتفعيل المصادقة الثنائية والنسخ الاحتياطي التلقائي لحماية بياناتك.
            تأكد من تحديث كلمات المرور بانتظام واستخدام كلمات مرور قوية.
          </p>
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
