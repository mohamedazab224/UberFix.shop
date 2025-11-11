import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Send } from 'lucide-react';

interface ComposeMessageProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (recipientId: string, subject: string, body: string) => Promise<boolean>;
  replyTo?: {
    id: string;
    subject: string;
    senderId: string;
  };
}

interface User {
  id: string;
  email: string;
  raw_user_meta_data?: {
    first_name?: string;
    last_name?: string;
  };
}

export const ComposeMessage = ({ open, onOpenChange, onSend, replyTo }: ComposeMessageProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    recipient: replyTo?.senderId || '',
    subject: replyTo ? `Re: ${replyTo.subject}` : '',
    body: '',
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-users');
        
        if (error) throw error;
        
        setUsers(data.users || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (open) {
      fetchUsers();
      if (replyTo) {
        setFormData({
          recipient: replyTo.senderId,
          subject: `Re: ${replyTo.subject}`,
          body: '',
        });
      }
    }
  }, [open, replyTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.recipient || !formData.subject || !formData.body) {
      return;
    }

    setSending(true);
    const success = await onSend(
      formData.recipient,
      formData.subject,
      formData.body
    );
    
    setSending(false);
    
    if (success) {
      setFormData({ recipient: '', subject: '', body: '' });
      onOpenChange(false);
    }
  };

  const getUserDisplayName = (user: User) => {
    const meta = user.raw_user_meta_data;
    if (meta?.first_name && meta?.last_name) {
      return `${meta.first_name} ${meta.last_name} (${user.email})`;
    }
    return user.email;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>{replyTo ? 'الرد على الرسالة' : 'رسالة جديدة'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">المستلم</Label>
            {loadingUsers ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري تحميل المستخدمين...
              </div>
            ) : (
              <Select
                value={formData.recipient}
                onValueChange={(value) => setFormData({ ...formData, recipient: value })}
                disabled={!!replyTo}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المستلم" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {getUserDisplayName(user)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">الموضوع</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="موضوع الرسالة"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">الرسالة</Label>
            <Textarea
              id="body"
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="اكتب رسالتك هنا..."
              rows={10}
              required
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={sending}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={sending || loadingUsers}>
              {sending ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Send className="ml-2 h-4 w-4" />
                  إرسال
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
