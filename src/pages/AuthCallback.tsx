import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          // Set the session with the tokens
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Error setting session:', error);
            toast({
              variant: "destructive",
              title: "خطأ في المصادقة",
              description: error.message,
            });
            navigate('/login');
            return;
          }

          // Success - redirect to dashboard
          toast({
            title: "تم تسجيل الدخول بنجاح",
            description: "مرحباً بك في UberFix",
          });
          navigate('/dashboard');
        } else {
          // No tokens found, redirect to login
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "حدث خطأ أثناء معالجة طلب المصادقة",
        });
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">جاري معالجة طلب المصادقة...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
