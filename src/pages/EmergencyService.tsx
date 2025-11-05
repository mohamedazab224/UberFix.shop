import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  ArrowRight,
  Star,
  Phone,
  Mail,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export default function EmergencyService() {
  const { technicianId } = useParams<{ technicianId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    description: '',
    priority: 'high' as const
  });

  const technicianData = location.state as {
    technicianName?: string;
    specialization?: string;
    rating?: number;
    status?: string;
  } | null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.address || !formData.description) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get user's company_id and branch_id from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user?.id)
        .single();
      
      const requestData: any = {
        title: `صيانة طارئة - ${technicianData?.specialization || 'خدمة'}`,
        description: formData.description,
        status: 'pending',
        priority: 'high',
        workflow_stage: 'SUBMITTED',
        client_name: formData.name,
        client_phone: formData.phone,
        location: formData.address,
        assigned_vendor_id: technicianId,
        created_by: user?.id,
        service_type: technicianData?.specialization || 'صيانة عامة',
        company_id: profile?.company_id || '00000000-0000-0000-0000-000000000000',
        branch_id: '00000000-0000-0000-0000-000000000000'
      };
      
      const { data, error } = await supabase
        .from('maintenance_requests')
        .insert(requestData)
        .select()
        .single();

      if (error) throw error;

      // إرسال إشعار للفني
      await supabase
        .from('notifications')
        .insert({
          recipient_id: technicianId,
          title: 'طلب صيانة طارئة جديد',
          message: `طلب صيانة طارئة من ${formData.name}`,
          type: 'warning',
          entity_type: 'maintenance_request',
          entity_id: data.id
        });

      toast({
        title: 'تم إرسال الطلب بنجاح',
        description: 'سيتم التواصل معك في أقرب وقت ممكن',
      });

      setTimeout(() => {
        navigate('/requests');
      }, 2000);

    } catch (error) {
      console.error('Error creating emergency request:', error);
      toast({
        title: 'خطأ',
        description: 'فشل إرسال الطلب، يرجى المحاولة مرة أخرى',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'FX';
    const names = name.split(' ');
    return names.length > 1 ? names[0][0] + names[1][0] : name.substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للخريطة
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-destructive/10 p-3 rounded-xl">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">طلب صيانة طارئة</h1>
              <p className="text-muted-foreground">سيتم الرد على طلبك في أسرع وقت ممكن</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Technician Info Card */}
          <Card className="md:col-span-1 h-fit">
            <CardHeader>
              <CardTitle className="text-lg">معلومات الفني</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-20 h-20 mb-3 bg-primary/10">
                  <AvatarFallback className="text-2xl font-bold bg-primary/20 text-primary">
                    {getInitials(technicianData?.technicianName || 'فني')}
                  </AvatarFallback>
                </Avatar>
                
                <h3 className="font-bold text-xl mb-1">
                  {technicianData?.technicianName || 'فني صيانة'}
                </h3>
                
                {technicianData?.specialization && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {technicianData.specialization}
                  </p>
                )}
                
                <div className="flex items-center gap-2 mb-3">
                  {technicianData?.rating && (
                    <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                      <Star className="w-4 h-4 fill-[#f5bf23] text-[#f5bf23]" />
                      <span className="text-sm font-semibold">{technicianData.rating}</span>
                    </div>
                  )}
                  <Badge 
                    className={technicianData?.status === 'available' 
                      ? 'bg-[#f5bf23] text-[#111] hover:bg-[#f5bf23]/90' 
                      : 'bg-muted text-muted-foreground'}
                  >
                    {technicianData?.status === 'available' ? '✓ متاح' : '○ مشغول'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>استجابة فورية</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#f5bf23]" />
                  <span>خدمة طوارئ 24/7</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Request Form */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>تفاصيل الطلب</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">الاسم *</Label>
                  <Input
                    id="name"
                    placeholder="أدخل اسمك الكامل"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف *</Label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="05XXXXXXXX"
                      className="pr-10"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">العنوان *</Label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Textarea
                      id="address"
                      placeholder="أدخل عنوان موقع الصيانة بالتفصيل"
                      className="pr-10 min-h-[80px]"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">وصف المشكلة *</Label>
                  <Textarea
                    id="description"
                    placeholder="صف المشكلة بالتفصيل..."
                    className="min-h-[120px]"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold text-destructive mb-1">طلب طوارئ</p>
                    <p className="text-muted-foreground">
                      سيتم معالجة طلبك بأولوية عالية وسيتواصل معك الفني في أقرب وقت ممكن.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#111] hover:bg-[#111]/90 text-white"
                  >
                    {loading ? 'جاري الإرسال...' : 'إرسال الطلب'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
