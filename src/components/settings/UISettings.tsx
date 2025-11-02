import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useState, useEffect } from "react";
import { Loader2, Palette, Map, Moon, Sun } from "lucide-react";

export function UISettings() {
  const { settings, isLoading, updateSettings } = useAppSettings();
  const [formData, setFormData] = useState({
    theme_mode: "light",
    map_style: "roadmap",
    show_footer: true,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        theme_mode: settings.theme_mode,
        map_style: settings.map_style,
        show_footer: settings.show_footer,
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
          <Palette className="h-5 w-5 text-primary" />
          إعدادات الواجهة والتصميم
        </CardTitle>
        <CardDescription>تخصيص شكل ومظهر التطبيق</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme Mode */}
        <div className="space-y-2">
          <Label htmlFor="theme_mode" className="flex items-center gap-2">
            {formData.theme_mode === "light" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            وضع العرض
          </Label>
          <Select
            value={formData.theme_mode}
            onValueChange={(value) => setFormData({ ...formData, theme_mode: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">وضع نهاري (Light)</SelectItem>
              <SelectItem value="dark">وضع ليلي (Dark)</SelectItem>
              <SelectItem value="auto">تلقائي (Auto)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Map Style */}
        <div className="space-y-2">
          <Label htmlFor="map_style" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            نمط الخريطة
          </Label>
          <Select
            value={formData.map_style}
            onValueChange={(value) => setFormData({ ...formData, map_style: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="roadmap">خريطة طريق (Roadmap)</SelectItem>
              <SelectItem value="satellite">أقمار صناعية (Satellite)</SelectItem>
              <SelectItem value="hybrid">مختلط (Hybrid)</SelectItem>
              <SelectItem value="terrain">تضاريس (Terrain)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Show Footer */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20">
          <div className="space-y-0.5">
            <Label htmlFor="show_footer">إظهار الفوتر</Label>
            <p className="text-sm text-muted-foreground">
              عرض تذييل الصفحة في الواجهة العامة
            </p>
          </div>
          <Switch
            id="show_footer"
            checked={formData.show_footer}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, show_footer: checked })
            }
          />
        </div>

        {/* Color Scheme Info */}
        <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
          <h4 className="font-medium mb-3">نظام الألوان - UberFix.shop</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <div className="h-12 rounded-lg" style={{ backgroundColor: "#f5bf23" }}></div>
              <p className="text-xs text-center font-medium">الذهبي الأساسي</p>
              <p className="text-xs text-center text-muted-foreground">#f5bf23</p>
            </div>
            <div className="space-y-2">
              <div className="h-12 rounded-lg" style={{ backgroundColor: "#111" }}></div>
              <p className="text-xs text-center font-medium">الأسود</p>
              <p className="text-xs text-center text-muted-foreground">#111</p>
            </div>
            <div className="space-y-2">
              <div className="h-12 rounded-lg border" style={{ backgroundColor: "#d2d2d2" }}></div>
              <p className="text-xs text-center font-medium">الخلفية</p>
              <p className="text-xs text-center text-muted-foreground">#d2d2d2</p>
            </div>
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
