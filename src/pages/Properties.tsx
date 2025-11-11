import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Search, Plus, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useProperties } from "@/hooks/useProperties";
import { useNavigate } from "react-router-dom";
import { PropertyQRCode } from "@/components/properties/PropertyQRCode";
import { PropertyActionsDialog } from "@/components/properties/PropertyActionsDialog";


export default function Properties() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProperty, setSelectedProperty] = useState<{id: string, name: string} | null>(null);
  const navigate = useNavigate();
  
  const { properties, loading, error } = useProperties();

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || property.type === typeFilter;
    const matchesStatus = statusFilter === "all" || property.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const statusConfig = {
    active: { label: "نشط", className: "bg-green-500 text-white" },
    maintenance: { label: "تحت الصيانة", className: "bg-yellow-500 text-white" },
    inactive: { label: "غير نشط", className: "bg-gray-500 text-white" }
  };

  const typeConfig = {
    commercial: { label: "تجاري", className: "bg-blue-500 text-white" },
    residential: { label: "سكني", className: "bg-green-500 text-white" },
    industrial: { label: "صناعي", className: "bg-orange-500 text-white" },
    office: { label: "مكتبي", className: "bg-purple-500 text-white" },
    retail: { label: "تجزئة", className: "bg-teal-500 text-white" }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">جاري تحميل العقارات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-center text-destructive">خطأ في تحميل العقارات: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">نظام إدارة العقارات</h1>
              <p className="text-muted-foreground">إدارة ومتابعة العقارات والممتلكات</p>
            </div>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => navigate("/properties/add")}
            >
              <Plus className="h-4 w-4 ml-2" />
              عقار جديد
            </Button>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="ابحث عن حساب..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-9"
                  />
                </div>
                <Button variant="outline" className="gap-2">
                  <Search className="h-4 w-4" />
                  ابحث عن عقار...
                </Button>
                <Button variant="outline" className="gap-2">
                  <Search className="h-4 w-4" />
                  اختر الجميل...
                </Button>
                <Button variant="outline" className="gap-2">
                  <Search className="h-4 w-4" />
                  ابحث عن مخطط...
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-3 flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">جاري تحميل العقارات...</p>
                </div>
              </div>
            ) : filteredProperties.length === 0 ? (
              <Card className="col-span-3">
                <CardContent className="text-center py-12">
                  <div className="space-y-3">
                    <div className="text-4xl opacity-50">🏢</div>
                    <p className="text-muted-foreground text-lg">
                      {properties.length === 0 
                        ? "لا توجد عقارات مسجلة بعد" 
                        : "لا توجد عقارات تطابق معايير البحث"
                      }
                    </p>
                    {properties.length === 0 && (
                      <Button onClick={() => navigate("/properties/add")} className="mt-3">
                        <Plus className="h-4 w-4 ml-2" />
                        إضافة أول عقار
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredProperties.map((property) => (
                <Card 
                  key={property.id} 
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/properties/${property.id}`)}
                >
                  {/* Property Image */}
                  <div className="relative h-48 bg-gradient-to-br from-muted to-muted/50">
                    {property.images && property.images.length > 0 ? (
                      <img 
                        src={property.images[0]} 
                        alt={property.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="h-20 w-20 text-muted-foreground/20" />
                      </div>
                    )}
                    {/* Property Type Badge with Icon */}
                    <div className="absolute top-3 left-3">
                      <div className="flex items-center gap-2 bg-background/90 backdrop-blur-sm rounded-full px-3 py-1">
                        {property.icon_url && (
                          <img 
                            src={property.icon_url} 
                            alt="" 
                            className="h-4 w-4"
                          />
                        )}
                        <span className="text-sm font-medium">
                          {typeConfig[property.type as keyof typeof typeConfig]?.label || property.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-4 space-y-4">
                    {/* Property Name with Icon */}
                    <div className="flex items-center gap-2">
                      {property.icon_url && (
                        <img 
                          src={property.icon_url} 
                          alt="" 
                          className="h-5 w-5 flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{property.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {typeConfig[property.type as keyof typeof typeConfig]?.label || property.type}
                        </p>
                      </div>
                    </div>

                    {/* Property Code */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>🔖</span>
                      <span className="font-medium">{property.code || 'لا يوجد كود'}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 bg-primary hover:bg-primary/90 min-w-0"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProperty({id: property.id, name: property.name});
                        }}
                      >
                        <span className="truncate">طلب صيانة جديد</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/properties/edit/${property.id}`);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 space-y-4">
          {/* Property Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">إعدادات العقارات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="نوع العقار" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="commercial">تجاري</SelectItem>
                  <SelectItem value="residential">سكني</SelectItem>
                  <SelectItem value="industrial">صناعي</SelectItem>
                  <SelectItem value="office">مكتبي</SelectItem>
                  <SelectItem value="retail">تجزئة</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="maintenance">تحت الصيانة</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="w-full">
                تصنيف العقار
              </Button>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">العقارات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">كافة العقارات</span>
                </div>
                <span className="font-semibold">{properties.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🌐 الدولة</span>
                </div>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🏙️ المدينة</span>
                </div>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🏗️ المشروع</span>
                </div>
                <span className="font-semibold">2</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">📍 الفرع</span>
                </div>
                <span className="font-semibold">4</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🏢 المبني</span>
                </div>
                <span className="font-semibold">0</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Property Actions Dialog */}
      {selectedProperty && (
        <PropertyActionsDialog
          propertyId={selectedProperty.id}
          propertyName={selectedProperty.name}
          open={!!selectedProperty}
          onOpenChange={(open) => !open && setSelectedProperty(null)}
        />
      )}
    </div>
  );
}