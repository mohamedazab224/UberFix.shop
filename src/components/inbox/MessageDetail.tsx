import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Message } from '@/hooks/useMessages';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Reply, Star, Archive, Trash2, ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface MessageDetailProps {
  message: Message;
  onReply: () => void;
  onToggleStar: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onBack: () => void;
  folder: 'inbox' | 'sent' | 'starred' | 'archived';
}

export const MessageDetail = ({
  message,
  onReply,
  onToggleStar,
  onArchive,
  onDelete,
  onBack,
  folder,
}: MessageDetailProps) => {
  const getSenderInfo = () => {
    const user = folder === 'sent' ? message.recipient : message.sender;
    if (!user) return { name: 'مستخدم غير معروف', email: '', initials: '؟' };
    
    const meta = user.raw_user_meta_data;
    const name = meta?.first_name && meta?.last_name
      ? `${meta.first_name} ${meta.last_name}`
      : user.email;
    
    const initials = meta?.first_name && meta?.last_name
      ? `${meta.first_name[0]}${meta.last_name[0]}`
      : user.email[0].toUpperCase();
    
    return { name, email: user.email, initials };
  };

  const sender = getSenderInfo();

  return (
    <div className="h-full flex flex-col">
      {/* Header with actions */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 ml-2" />
          رجوع
        </Button>
        
        <div className="flex gap-2">
          {folder === 'inbox' && (
            <Button variant="outline" size="sm" onClick={onReply}>
              <Reply className="h-4 w-4 ml-2" />
              رد
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleStar}
          >
            <Star
              className={`h-4 w-4 ml-2 ${
                message.is_starred ? 'fill-yellow-400 text-yellow-400' : ''
              }`}
            />
            {message.is_starred ? 'إزالة النجمة' : 'إضافة نجمة'}
          </Button>
          
          {folder !== 'archived' && (
            <Button variant="outline" size="sm" onClick={onArchive}>
              <Archive className="h-4 w-4 ml-2" />
              أرشفة
            </Button>
          )}
          
          {folder === 'sent' && (
            <Button variant="outline" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4 ml-2" />
              حذف
            </Button>
          )}
        </div>
      </div>

      {/* Message content */}
      <div className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {sender.initials}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <h3 className="font-semibold text-lg">{sender.name}</h3>
                    <p className="text-sm text-muted-foreground">{sender.email}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(message.created_at), {
                        addSuffix: true,
                        locale: ar,
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(message.created_at).toLocaleString('ar-EG', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <h2 className="text-xl font-bold">{message.subject}</h2>
                  {message.parent_message_id && (
                    <Badge variant="outline">رد</Badge>
                  )}
                  {message.is_starred && (
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          
          <Separator />
          
          <CardContent className="pt-6">
            <div className="prose prose-sm max-w-none text-right" dir="rtl">
              <p className="whitespace-pre-wrap text-base leading-relaxed">
                {message.body}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
