import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useState, useEffect } from "react";
import { Loader2, Plug, Mail, MapPin, Database } from "lucide-react";

export function IntegrationsSettings() {
  const { settings, isLoading, updateSettings } = useAppSettings();
  const [formData, setFormData] = useState({
    google_maps_enabled: true,
    erpnext_enabled: false,
    erpnext_url: "",
    smtp_host: "",
    smtp_port: 587,
    smtp_username: "",
    smtp_from_email: "",
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        google_maps_enabled: settings.google_maps_enabled,
        erpnext_enabled: settings.erpnext_enabled,
        erpnext_url: settings.erpnext_url || "",
        smtp_host: settings.smtp_host || "",
        smtp_port: settings.smtp_port || 587,
        smtp_username: settings.smtp_username || "",
        smtp_from_email: settings.smtp_from_email || "",
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
          <Plug className="h-5 w-5 text-primary" />
          التكاملات الخارجية
        </CardTitle>
        <CardDescription>إدارة الاتصال بالخدمات والأنظمة الخارجية</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Google Maps */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20">
          <div className="space-y-0.5">
            <Label htmlFor="google_maps" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              تفعيل Google Maps
            </Label>
            <p className="text-sm text-muted-foreground">
              استخدام خرائط جوجل في التطبيق
            </p>
          </div>
          <Switch
            id="google_maps"
            checked={formData.google_maps_enabled}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, google_maps_enabled: checked })
            }
          />
        </div>

        {/* ERPNext Integration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20">
            <div className="space-y-0.5">
              <Label htmlFor="erpnext" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                تفعيل ERPNext
              </Label>
              <p className="text-sm text-muted-foreground">
                الربط مع نظام ERPNext
              </p>
            </div>
            <Switch
              id="erpnext"
              checked={formData.erpnext_enabled}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, erpnext_enabled: checked })
              }
            />
          </div>

          {formData.erpnext_enabled && (
            <div className="space-y-2 pr-4">
              <Label htmlFor="erpnext_url">رابط ERPNext</Label>
              <Input
                id="erpnext_url"
                value={formData.erpnext_url}
                onChange={(e) => setFormData({ ...formData, erpnext_url: e.target.value })}
                placeholder="https://your-erpnext.com"
              />
            </div>
          )}
        </div>

        {/* SMTP Configuration */}
        <div className="space-y-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="font-medium flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            إعدادات البريد الإلكتروني (SMTP)
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp_host">SMTP Host</Label>
              <Input
                id="smtp_host"
                value={formData.smtp_host}
                onChange={(e) => setFormData({ ...formData, smtp_host: e.target.value })}
                placeholder="smtp.gmail.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp_port">SMTP Port</Label>
              <Input
                id="smtp_port"
                type="number"
                value={formData.smtp_port}
                onChange={(e) => setFormData({ ...formData, smtp_port: parseInt(e.target.value) })}
                placeholder="587"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="smtp_username">SMTP Username</Label>
            <Input
              id="smtp_username"
              value={formData.smtp_username}
              onChange={(e) => setFormData({ ...formData, smtp_username: e.target.value })}
              placeholder="your-email@gmail.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="smtp_from">From Email</Label>
            <Input
              id="smtp_from"
              type="email"
              value={formData.smtp_from_email}
              onChange={(e) => setFormData({ ...formData, smtp_from_email: e.target.value })}
              placeholder="noreply@uberfix.shop"
            />
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
