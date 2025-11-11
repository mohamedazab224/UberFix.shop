import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  body: string;
  is_read: boolean;
  is_starred: boolean;
  is_archived: boolean;
  parent_message_id: string | null;
  created_at: string;
  updated_at: string;
  sender?: {
    email: string;
    raw_user_meta_data?: {
      first_name?: string;
      last_name?: string;
    };
  };
  recipient?: {
    email: string;
    raw_user_meta_data?: {
      first_name?: string;
      last_name?: string;
    };
  };
}

export const useMessages = (folder: 'inbox' | 'sent' | 'starred' | 'archived' = 'inbox') => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      let query = supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter based on folder
      switch (folder) {
        case 'inbox':
          query = query.eq('recipient_id', user.id).eq('is_archived', false);
          break;
        case 'sent':
          query = query.eq('sender_id', user.id).eq('is_archived', false);
          break;
        case 'starred':
          query = query.or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`).eq('is_starred', true).eq('is_archived', false);
          break;
        case 'archived':
          query = query.or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`).eq('is_archived', true);
          break;
      }

      const { data: messagesData, error } = await query;

      if (error) throw error;
      
      // Fetch user details for each message
      const messagesWithUsers = await Promise.all(
        (messagesData || []).map(async (msg) => {
          const { data: usersData } = await supabase.functions.invoke('get-users');
          const allUsers = usersData?.users || [];
          
          const sender = allUsers.find((u: any) => u.id === msg.sender_id);
          const recipient = allUsers.find((u: any) => u.id === msg.recipient_id);
          
          return {
            ...msg,
            sender: sender || { email: 'Unknown', raw_user_meta_data: {} },
            recipient: recipient || { email: 'Unknown', raw_user_meta_data: {} },
          };
        })
      );
      
      setMessages(messagesWithUsers as Message[]);

      // Count unread messages in inbox
      if (folder === 'inbox') {
        const unread = messagesWithUsers.filter(m => !m.is_read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحميل الرسائل',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (recipientId: string, subject: string, body: string, parentMessageId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        recipient_id: recipientId,
        subject,
        body,
        parent_message_id: parentMessageId || null,
      });

      if (error) throw error;

      toast({
        title: 'تم الإرسال',
        description: 'تم إرسال الرسالة بنجاح',
      });

      fetchMessages();
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'خطأ',
        description: 'فشل إرسال الرسالة',
        variant: 'destructive',
      });
      return false;
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) throw error;
      fetchMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const toggleStar = async (messageId: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_starred: !currentState })
        .eq('id', messageId);

      if (error) throw error;
      fetchMessages();
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

  const archiveMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_archived: true })
        .eq('id', messageId);

      if (error) throw error;
      
      toast({
        title: 'تم الأرشفة',
        description: 'تم نقل الرسالة إلى الأرشيف',
      });
      
      fetchMessages();
    } catch (error) {
      console.error('Error archiving message:', error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
      
      toast({
        title: 'تم الحذف',
        description: 'تم حذف الرسالة بنجاح',
      });
      
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: 'خطأ',
        description: 'فشل حذف الرسالة',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchMessages();

    // Setup realtime subscription
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [folder]);

  return {
    messages,
    loading,
    unreadCount,
    sendMessage,
    markAsRead,
    toggleStar,
    archiveMessage,
    deleteMessage,
    refreshMessages: fetchMessages,
  };
};
