import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SendMessageParams {
  to: string;
  message: string;
  type?: 'sms' | 'whatsapp';
  requestId?: string;
  templateId?: string;
  variables?: Record<string, string>;
}

export function useTwilioMessages() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async (params: SendMessageParams) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('send-twilio-message', {
        body: params
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'فشل في إرسال الرسالة');
      }

      toast({
        title: 'تم إرسال الرسالة',
        description: `تم إرسال ${params.type === 'whatsapp' ? 'رسالة WhatsApp' : 'رسالة نصية'} بنجاح`,
      });

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'خطأ في إرسال الرسالة',
        description: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendSMS = async (to: string, message: string, requestId?: string) => {
    return sendMessage({ to, message, type: 'sms', requestId });
  };

  const sendWhatsApp = async (to: string, message: string, requestId?: string) => {
    return sendMessage({ to, message, type: 'whatsapp', requestId });
  };

  const sendWhatsAppTemplate = async (
    to: string,
    templateId: string,
    variables: Record<string, string>,
    requestId?: string
  ) => {
    return sendMessage({
      to,
      message: '', // سيتم استخدام القالب
      type: 'whatsapp',
      templateId,
      variables,
      requestId
    });
  };

  // إرسال إشعار لطلب صيانة
  const sendMaintenanceNotification = async (
    requestId: string,
    phone: string,
    type: 'created' | 'assigned' | 'in_progress' | 'completed',
    preferredMethod: 'sms' | 'whatsapp' = 'sms'
  ) => {
    const messages = {
      created: 'تم استلام طلب الصيانة الخاص بك. سيتم التواصل معك قريباً.',
      assigned: 'تم تعيين فني لطلب الصيانة الخاص بك.',
      in_progress: 'الفني في طريقه إليك الآن.',
      completed: 'تم إكمال طلب الصيانة بنجاح. شكراً لثقتك بنا.'
    };

    return sendMessage({
      to: phone,
      message: messages[type],
      type: preferredMethod,
      requestId
    });
  };

  return {
    sendMessage,
    sendSMS,
    sendWhatsApp,
    sendWhatsAppTemplate,
    sendMaintenanceNotification,
    loading
  };
}
