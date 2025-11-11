import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Inbox as InboxIcon,
  Send,
  Star,
  Archive,
  Edit,
  Loader2,
} from 'lucide-react';
import { useMessages, Message } from '@/hooks/useMessages';
import { MessageList } from '@/components/inbox/MessageList';
import { MessageDetail } from '@/components/inbox/MessageDetail';
import { ComposeMessage } from '@/components/inbox/ComposeMessage';

type Folder = 'inbox' | 'sent' | 'starred' | 'archived';

const Inbox = () => {
  const [currentFolder, setCurrentFolder] = useState<Folder>('inbox');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: string; subject: string; senderId: string } | undefined>();

  const {
    messages,
    loading,
    unreadCount,
    sendMessage,
    markAsRead,
    toggleStar,
    archiveMessage,
    deleteMessage,
  } = useMessages(currentFolder);

  const handleSelectMessage = async (message: Message) => {
    setSelectedMessage(message);
    
    // Mark as read if it's in inbox and unread
    if (currentFolder === 'inbox' && !message.is_read) {
      await markAsRead(message.id);
    }
  };

  const handleReply = () => {
    if (selectedMessage) {
      setReplyTo({
        id: selectedMessage.id,
        subject: selectedMessage.subject,
        senderId: selectedMessage.sender_id,
      });
      setComposeOpen(true);
    }
  };

  const handleCompose = () => {
    setReplyTo(undefined);
    setComposeOpen(true);
  };

  const folders = [
    { id: 'inbox' as Folder, label: 'الوارد', icon: InboxIcon, badge: unreadCount },
    { id: 'sent' as Folder, label: 'المرسل', icon: Send },
    { id: 'starred' as Folder, label: 'المميزة بنجمة', icon: Star },
    { id: 'archived' as Folder, label: 'الأرشيف', icon: Archive },
  ];

  return (
    <div className="min-h-screen bg-background p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">صندوق البريد</h1>
          <p className="text-muted-foreground">إدارة رسائلك الداخلية</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Sidebar */}
          <Card className="lg:col-span-1 p-4">
            <Button onClick={handleCompose} className="w-full mb-4" size="lg">
              <Edit className="ml-2 h-5 w-5" />
              رسالة جديدة
            </Button>

            <Separator className="mb-4" />

            <nav className="space-y-2">
              {folders.map((folder) => {
                const Icon = folder.icon;
                const isActive = currentFolder === folder.id;
                
                return (
                  <Button
                    key={folder.id}
                    variant={isActive ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => {
                      setCurrentFolder(folder.id);
                      setSelectedMessage(null);
                    }}
                  >
                    <Icon className="ml-2 h-5 w-5" />
                    <span className="flex-1 text-right">{folder.label}</span>
                    {folder.badge !== undefined && folder.badge > 0 && (
                      <Badge variant="secondary" className="mr-auto">
                        {folder.badge}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </nav>
          </Card>

          {/* Message List */}
          <Card className="lg:col-span-1 p-4">
            <h2 className="text-lg font-semibold mb-4">
              {folders.find(f => f.id === currentFolder)?.label}
            </h2>
            
            <ScrollArea className="h-[calc(100vh-300px)]">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <MessageList
                  messages={messages}
                  selectedMessageId={selectedMessage?.id || null}
                  onSelectMessage={handleSelectMessage}
                  onToggleStar={toggleStar}
                  onArchive={archiveMessage}
                  onDelete={deleteMessage}
                  folder={currentFolder}
                />
              )}
            </ScrollArea>
          </Card>

          {/* Message Detail */}
          <Card className="lg:col-span-2">
            {selectedMessage ? (
              <MessageDetail
                message={selectedMessage}
                onReply={handleReply}
                onToggleStar={() => toggleStar(selectedMessage.id, selectedMessage.is_starred)}
                onArchive={() => {
                  archiveMessage(selectedMessage.id);
                  setSelectedMessage(null);
                }}
                onDelete={() => {
                  deleteMessage(selectedMessage.id);
                  setSelectedMessage(null);
                }}
                onBack={() => setSelectedMessage(null)}
                folder={currentFolder}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <InboxIcon className="h-24 w-24 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">اختر رسالة لعرضها</h3>
                <p className="text-muted-foreground">
                  اختر رسالة من القائمة لعرض تفاصيلها
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      <ComposeMessage
        open={composeOpen}
        onOpenChange={setComposeOpen}
        onSend={sendMessage}
        replyTo={replyTo}
      />
    </div>
  );
};

export default Inbox;
