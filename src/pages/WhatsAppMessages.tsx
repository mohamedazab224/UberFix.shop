import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { WhatsAppMessagesTable } from '@/components/whatsapp/WhatsAppMessagesTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { MessageSquare, Send } from 'lucide-react';
import { whatsappFormSchema } from '@/lib/validationSchemas';
import { z } from 'zod';

type WhatsAppFormData = z.infer<typeof whatsappFormSchema>;

export default function WhatsAppMessages() {
  const { sendWhatsAppMessage, isSending } = useWhatsApp();

  const form = useForm<WhatsAppFormData>({
    resolver: zodResolver(whatsappFormSchema),
    defaultValues: {
      to: '',
      message: '',
      media_url: '',
    },
  });

  const onSubmit = async (data: WhatsAppFormData) => {
    try {
      await sendWhatsAppMessage({
        to: data.to,
        message: data.message,
        media_url: data.media_url || undefined,
      });
      
      // Clear form
      form.reset();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center gap-3">
        <MessageSquare className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">إدارة رسائل WhatsApp</h1>
          <p className="text-muted-foreground">إرسال وتتبع رسائل WhatsApp</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>إرسال رسالة جديدة</CardTitle>
          <CardDescription>أرسل رسالة WhatsApp إلى رقم هاتف</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الهاتف *</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+201234567890"
                        dir="ltr"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      مثال: +201234567890 (يجب أن يبدأ بـ + متبوعاً برمز الدولة)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الرسالة *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="اكتب رسالتك هنا (حد أقصى 4096 حرف)..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value?.length || 0} / 4096 حرف
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="media_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رابط الوسائط (اختياري)</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        dir="ltr"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      رابط صورة أو فيديو لإرفاقه بالرسالة
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSending}>
                <Send className="h-4 w-4 ml-2" />
                {isSending ? 'جاري الإرسال...' : 'إرسال الرسالة'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>سجل الرسائل</CardTitle>
          <CardDescription>جميع رسائل WhatsApp المرسلة مع حالاتها</CardDescription>
        </CardHeader>
        <CardContent>
          <WhatsAppMessagesTable />
        </CardContent>
      </Card>
    </div>
  );
}
