import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface WhatsAppMessage {
  id: string;
  message_sid: string;
  recipient_phone: string;
  message_body: string;
  status: string;
  created_at: string;
  delivered_at?: string;
  read_at?: string;
  error_message?: string;
}

export function WhatsAppMessagesTable() {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('whatsapp-messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_messages',
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching WhatsApp messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      queued: { variant: 'secondary', label: 'في الانتظار' },
      sent: { variant: 'default', label: 'تم الإرسال' },
      delivered: { variant: 'default', label: 'تم التسليم' },
      read: { variant: 'default', label: 'تمت القراءة' },
      failed: { variant: 'destructive', label: 'فشل' },
      undelivered: { variant: 'destructive', label: 'لم يتم التسليم' },
    };

    const statusInfo = statusMap[status] || { variant: 'outline' as const, label: status };

    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        لا توجد رسائل WhatsApp حتى الآن
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>رقم الهاتف</TableHead>
            <TableHead>الرسالة</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>تاريخ الإرسال</TableHead>
            <TableHead>التسليم</TableHead>
            <TableHead>القراءة</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {messages.map((message) => (
            <TableRow key={message.id}>
              <TableCell className="font-medium">
                {message.recipient_phone}
              </TableCell>
              <TableCell className="max-w-md truncate">
                {message.message_body}
              </TableCell>
              <TableCell>
                {getStatusBadge(message.status)}
                {message.error_message && (
                  <div className="text-xs text-destructive mt-1">
                    {message.error_message}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-sm">
                {format(new Date(message.created_at), 'dd/MM/yyyy HH:mm', { locale: ar })}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {message.delivered_at
                  ? format(new Date(message.delivered_at), 'HH:mm', { locale: ar })
                  : '-'}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {message.read_at
                  ? format(new Date(message.read_at), 'HH:mm', { locale: ar })
                  : '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
