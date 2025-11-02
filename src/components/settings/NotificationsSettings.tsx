import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useState, useEffect } from "react";
import { Loader2, Bell, Mail, MessageSquare, Clock } from "lucide-react";

export function NotificationsSettings() {
  const { settings, isLoading, updateSettings } = useAppSettings();
  const [formData, setFormData] = useState({
    enable_email_notifications: true,
    enable_sms_notifications: false,
    enable_in_app_notifications: true,
    enable_reminders: true,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        enable_email_notifications: settings.enable_email_notifications,
        enable_sms_notifications: settings.enable_sms_notifications,
        enable_in_app_notifications: settings.enable_in_app_notifications,
        enable_reminders: settings.enable_reminders,
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
          <Bell className="h-5 w-5 text-primary" />
          إعدادات الإشعارات
        </CardTitle>
        <CardDescription>التحكم في أنواع الإشعارات والتنبيهات</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Notifications */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20">
          <div className="space-y-0.5">
            <Label htmlFor="email_notif" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              إشعارات البريد الإلكتروني
            </Label>
            <p className="text-sm text-muted-foreground">
              إرسال إشعارات عبر البريد الإلكتروني
            </p>
          </div>
          <Switch
            id="email_notif"
            checked={formData.enable_email_notifications}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, enable_email_notifications: checked })
            }
          />
        </div>

        {/* SMS Notifications */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20">
          <div className="space-y-0.5">
            <Label htmlFor="sms_notif" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              إشعارات الرسائل النصية (SMS)
            </Label>
            <p className="text-sm text-muted-foreground">
              إرسال إشعارات عبر الرسائل النصية القصيرة
            </p>
          </div>
          <Switch
            id="sms_notif"
            checked={formData.enable_sms_notifications}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, enable_sms_notifications: checked })
            }
          />
        </div>

        {/* In-App Notifications */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20">
          <div className="space-y-0.5">
            <Label htmlFor="inapp_notif" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              الإشعارات داخل التطبيق
            </Label>
            <p className="text-sm text-muted-foreground">
              عرض الإشعارات داخل واجهة التطبيق
            </p>
          </div>
          <Switch
            id="inapp_notif"
            checked={formData.enable_in_app_notifications}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, enable_in_app_notifications: checked })
            }
          />
        </div>

        {/* Reminders */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20">
          <div className="space-y-0.5">
            <Label htmlFor="reminders" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              التذكيرات التلقائية
            </Label>
            <p className="text-sm text-muted-foreground">
              إرسال تذكيرات تلقائية للمواعيد والمهام
            </p>
          </div>
          <Switch
            id="reminders"
            checked={formData.enable_reminders}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, enable_reminders: checked })
            }
          />
        </div>

        {/* Notification Types Info */}
        <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="font-medium mb-2">أنواع الإشعارات المفعّلة</h4>
          <div className="flex flex-wrap gap-2">
            {formData.enable_email_notifications && (
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">Email</span>
            )}
            {formData.enable_sms_notifications && (
              <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">SMS</span>
            )}
            {formData.enable_in_app_notifications && (
              <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm">In-App</span>
            )}
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
