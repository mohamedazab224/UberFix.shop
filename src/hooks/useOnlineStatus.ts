import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "متصل بالإنترنت",
        description: "تم استعادة الاتصال بالإنترنت",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "غير متصل بالإنترنت",
        description: "يتم العمل في وضع عدم الاتصال",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  return isOnline;
}
