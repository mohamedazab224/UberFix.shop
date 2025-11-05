import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ServiceRequestDialogProps {
  technicianId: string;
  technicianName: string;
  onClose: () => void;
}

export const ServiceRequestDialog = ({ 
  technicianId, 
  technicianName,
  onClose 
}: ServiceRequestDialogProps) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !phone || !description) {
      toast({
        title: 'خطأ',
        description: 'الرجاء ملء جميع الحقول',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .insert([{
          title: `طلب خدمة من ${name}`,
          client_name: name,
          client_phone: phone,
          description: description,
          branch_id: '00000000-0000-0000-0000-000000000000',
          company_id: '00000000-0000-0000-0000-000000000000',
          status: 'Open',
          priority: 'normal'
        }]);

      if (error) throw error;

      toast({
        title: 'تم إرسال الطلب',
        description: `تم إرسال طلبك إلى ${technicianName} بنجاح`,
      });

      onClose();
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: 'خطأ',
        description: 'فشل إرسال الطلب، الرجاء المحاولة مرة أخرى',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-xl w-80" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-gray-900">طلب خدمة من {technicianName}</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-xl leading-none"
        >
          ×
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Input
            placeholder="الاسم"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full"
            required
          />
        </div>
        
        <div>
          <Input
            placeholder="رقم الهاتف"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full"
            required
          />
        </div>
        
        <div>
          <Textarea
            placeholder="وصف المشكلة..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full min-h-[80px]"
            required
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            type="submit"
            className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold"
            disabled={loading}
          >
            {loading ? 'جاري الإرسال...' : 'إرسال الطلب'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            إلغاء
          </Button>
        </div>
      </form>
    </div>
  );
};
