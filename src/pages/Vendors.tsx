import { useState } from "react";
import { VendorCard } from "@/components/vendors/VendorCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Search, Filter, Plus, Users, Star, Clock } from "lucide-react";
import { NewVendorForm } from "@/components/forms/NewVendorForm";
import { useVendors } from "@/hooks/useVendors";
import { toast } from "@/hooks/use-toast";

const mockVendors = [
  {
    id: "1",
    name: "أحمد محمد علي",
    specialty: "سباك محترف",
    rating: 4.8,
    completedJobs: 125,
    location: "المنصورة، الدقهلية",
    phone: "01012345678",
    status: "available" as const,
    unitRate: "50 ج.م/وحدة",
    verified: true,
    responseTime: "15 دقيقة"
  },
  {
    id: "2", 
    name: "محمد عزب",
    specialty: "كهربائي معتمد",
    rating: 4.9,
    completedJobs: 89,
    location: "القاهرة، مصر الجديدة",
    phone: "01123456789",
    status: "busy" as const,
    unitRate: "45 ج.م/وحدة",
    verified: true,
    responseTime: "30 دقيقة"
  },
  {
    id: "3",
    name: "سارة أحمد",
    specialty: "فني تكييف",
    rating: 4.7,
    completedJobs: 67,
    location: "الإسكندرية",
    phone: "01234567890",
    status: "available" as const,
    unitRate: "55 ج.م/وحدة",
    verified: false,
    responseTime: "20 دقيقة"
  },
  {
    id: "4",
    name: "عمر حسن",
    specialty: "نجار ديكور",
    rating: 4.6,
    completedJobs: 45,
    location: "الجيزة، 6 أكتوبر",
    phone: "01345678901",
    status: "offline" as const,
    unitRate: "60 ج.م/وحدة",
    verified: true,
    responseTime: "45 دقيقة"
  }
];

export default function Vendors() {
  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showNewVendorForm, setShowNewVendorForm] = useState(false);
  
  const { vendors, loading, error } = useVendors();

  // استخدام البيانات الحقيقية إذا كانت متاحة، وإلا استخدام البيانات التجريبية
  const vendorList = loading ? [] : vendors.length > 0 ? vendors : mockVendors;
  
  const filteredVendors = vendorList.filter((vendor: any) => {
    const vendorName = vendor.name;
    const vendorSpecialty = vendor.specialty;
    const vendorStatus = vendor.status;
    
    const matchesSearch = vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendorSpecialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = specialtyFilter === "all" || vendorSpecialty.includes(specialtyFilter);
    const matchesStatus = statusFilter === "all" || vendorStatus === statusFilter;
    
    return matchesSearch && matchesSpecialty && matchesStatus;
  });

  const handleContact = (vendorId: string) => {
    const vendor = vendorList.find(v => v.id === vendorId);
    if (vendor && vendor.phone) {
      window.open(`tel:${vendor.phone}`);
    } else {
      toast({
        title: "لا يوجد رقم هاتف",
        description: "لم يتم تسجيل رقم هاتف لهذا الفني",
        variant: "destructive"
      });
    }
  };

  const handleAssign = (vendorId: string) => {
    const vendor = vendorList.find(v => v.id === vendorId);
    if (vendor) {
      toast({
        title: "تم التعيين",
        description: `تم تعيين ${vendor.name} للمهمة`
      });
    }
  };

  const stats = {
    total: vendorList.length,
    available: vendorList.filter(v => v.status === "available").length,
    busy: vendorList.filter(v => v.status === "busy").length,
    avgRating: vendorList.length > 0 ? (vendorList.reduce((sum, v) => sum + v.rating, 0) / vendorList.length).toFixed(1) : '0'
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">الموردين والفنيين</h1>
          <p className="text-muted-foreground">إدارة شبكة الموردين والفنيين</p>
        </div>
        <Dialog open={showNewVendorForm} onOpenChange={setShowNewVendorForm}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 ml-2" />
              إضافة مورد جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <NewVendorForm 
              onClose={() => setShowNewVendorForm(false)}
              onSuccess={() => {
                setShowNewVendorForm(false);
                toast({
                  title: "تم بنجاح",
                  description: "تم إضافة المورد الجديد بنجاح"
                });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الموردين</p>
                <p className="text-2xl font-bold text-primary">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">متاحين الآن</p>
                <p className="text-2xl font-bold text-green-500">{stats.available}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">مشغولين</p>
                <p className="text-2xl font-bold text-yellow-500">{stats.busy}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Star className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">متوسط التقييم</p>
                <p className="text-2xl font-bold text-orange-500">{stats.avgRating}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>البحث والتصفية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في الموردين..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-9"
              />
            </div>
            
            <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="التخصص" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع التخصصات</SelectItem>
                <SelectItem value="سباك">سباكة</SelectItem>
                <SelectItem value="كهربائي">كهرباء</SelectItem>
                <SelectItem value="تكييف">تكييف</SelectItem>
                <SelectItem value="نجار">نجارة</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="available">متاح</SelectItem>
                <SelectItem value="busy">مشغول</SelectItem>
                <SelectItem value="offline">غير متاح</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Filter className="h-4 w-4 ml-2" />
              تصفية متقدمة
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vendors Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">جاري تحميل البيانات...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor: any) => (
            <VendorCard
              key={vendor.id}
              vendor={{
                id: vendor.id,
                name: vendor.name,
                specialty: vendor.specialty || (vendor.specialization && vendor.specialization[0]) || 'غير محدد',
                rating: vendor.rating || 0,
                completedJobs: vendor.completedJobs || vendor.completed_jobs || 0,
                location: vendor.address || vendor.location || 'غير محدد',
                phone: vendor.phone || '',
                status: vendor.status || 'offline',
                unitRate: vendor.unit_rate ? `${vendor.unit_rate} جنيه/وحدة` : vendor.unitRate || '0 جنيه/وحدة',
                verified: vendor.certifications ? vendor.certifications.length > 0 : vendor.verified || false,
                responseTime: vendor.responseTime || vendor.response_time || '30 دقيقة'
              }}
              onContact={handleContact}
              onAssign={handleAssign}
            />
          ))}
        </div>
      )}

      {!loading && filteredVendors.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {error ? 'حدث خطأ في تحميل البيانات' : 'لا توجد فنيين تطابق معايير البحث'}
            </p>
            {error && (
              <p className="text-sm text-destructive mt-2">{error}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
