import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Mail, MailOpen, Archive, Trash2 } from 'lucide-react';
import { Message } from '@/hooks/useMessages';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

interface MessageListProps {
  messages: Message[];
  selectedMessageId: string | null;
  onSelectMessage: (message: Message) => void;
  onToggleStar: (messageId: string, currentState: boolean) => void;
  onArchive: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  folder: 'inbox' | 'sent' | 'starred' | 'archived';
}

export const MessageList = ({
  messages,
  selectedMessageId,
  onSelectMessage,
  onToggleStar,
  onArchive,
  onDelete,
  folder,
}: MessageListProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

  const getSenderName = (message: Message) => {
    const user = folder === 'sent' ? message.recipient : message.sender;
    if (!user) return 'مستخدم غير معروف';
    
    const meta = user.raw_user_meta_data;
    if (meta?.first_name && meta?.last_name) {
      return `${meta.first_name} ${meta.last_name}`;
    }
    return user.email;
  };

  const handleDeleteClick = (messageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMessageToDelete(messageId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (messageToDelete) {
      onDelete(messageToDelete);
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    }
  };

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Mail className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">لا توجد رسائل</h3>
        <p className="text-sm text-muted-foreground">
          {folder === 'inbox' && 'صندوق الوارد فارغ'}
          {folder === 'sent' && 'لم ترسل أي رسائل بعد'}
          {folder === 'starred' && 'لا توجد رسائل مميزة بنجمة'}
          {folder === 'archived' && 'لا توجد رسائل مؤرشفة'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {messages.map((message) => (
          <Card
            key={message.id}
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedMessageId === message.id ? 'border-primary bg-primary/5' : ''
            } ${!message.is_read && folder === 'inbox' ? 'bg-accent/20' : ''}`}
            onClick={() => onSelectMessage(message)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {folder === 'inbox' && !message.is_read && (
                    <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                  )}
                  {folder === 'inbox' && message.is_read && (
                    <MailOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className={`font-semibold truncate ${!message.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {getSenderName(message)}
                  </span>
                  {message.is_starred && (
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                  )}
                </div>
                
                <h4 className={`font-medium truncate mb-1 ${!message.is_read ? 'font-bold' : ''}`}>
                  {message.subject}
                </h4>
                
                <p className="text-sm text-muted-foreground truncate">
                  {message.body}
                </p>
                
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(message.created_at), {
                      addSuffix: true,
                      locale: ar,
                    })}
                  </span>
                  {message.parent_message_id && (
                    <Badge variant="outline" className="text-xs">
                      رد
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-1 flex-shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStar(message.id, message.is_starred);
                  }}
                  className="h-8 w-8"
                >
                  <Star
                    className={`h-4 w-4 ${
                      message.is_starred ? 'fill-yellow-400 text-yellow-400' : ''
                    }`}
                  />
                </Button>
                
                {folder !== 'archived' && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onArchive(message.id);
                    }}
                    className="h-8 w-8"
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                )}
                
                {folder === 'sent' && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => handleDeleteClick(message.id, e)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه الرسالة؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
