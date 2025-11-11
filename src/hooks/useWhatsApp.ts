import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SendWhatsAppParams {
  to: string;
  message: string;
  request_id?: string;
  media_url?: string;
}

export function useWhatsApp() {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const sendWhatsAppMessage = async (params: SendWhatsAppParams) => {
    setIsSending(true);
    
    try {
      // Get the current session to include auth token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('يجب تسجيل الدخول أولاً');
      }

      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: params,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'فشل إرسال الرسالة');
      }

      toast({
        title: 'تم الإرسال بنجاح',
        description: 'تم إرسال رسالة WhatsApp بنجاح',
      });

      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'حدث خطأ أثناء إرسال الرسالة';
      
      toast({
        title: 'خطأ في الإرسال',
        description: message,
        variant: 'destructive',
      });
      
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  return {
    sendWhatsAppMessage,
    isSending,
  };
}
