import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building2, UserPlus } from 'lucide-react';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { smartSignup, smartLogin } from '@/lib/smartAuth';
import { loginFormSchema, registerFormSchema } from '@/lib/validationSchemas';
import { z } from 'zod';

type LoginFormData = z.infer<typeof loginFormSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const { toast } = useToast();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await smartLogin(data.email, data.password);
      
      if (result.ok) {
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في نظام إدارة الصيانة",
        });
      } else {
        const messages = {
          confirm_resent: "تم إرسال رابط التفعيل إلى بريدك الإلكتروني",
          reset_sent: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني",
          error: result.error?.message || "حدث خطأ في تسجيل الدخول"
        };
        
        toast({
          title: result.mode === 'error' ? "خطأ في تسجيل الدخول" : "تم الإرسال",
          description: messages[result.mode as keyof typeof messages],
          variant: result.mode === 'error' ? "destructive" : "default",
        });
      }
    } catch (error: any) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    const email = loginForm.getValues('email');
    const password = loginForm.getValues('password');
    
    if (!email || !password) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال البريد الإلكتروني وكلمة المرور",
        variant: "destructive",
      });
      return;
    }

    setIsSigningUp(true);

    try {
      const result = await smartSignup(email, password, 'محمد عزب');
      
      if (result.ok) {
        toast({
          title: result.mode === 'signup' ? "تم إنشاء الحساب بنجاح" : "تم تسجيل الدخول بنجاح",
          description: result.mode === 'signup' ? "يمكنك الآن تسجيل الدخول" : "مرحباً بك في نظام إدارة الصيانة",
        });
      } else {
        const messages = {
          confirm_resent: "تم إرسال رابط التفعيل إلى بريدك الإلكتروني",
          reset_sent: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني",
          otp_sent: "تم إرسال رابط دخول سحري إلى بريدك الإلكتروني",
          error: result.error?.message || "حدث خطأ في إنشاء الحساب"
        };
        
        toast({
          title: result.mode === 'error' ? "خطأ في إنشاء الحساب" : "تم الإرسال",
          description: messages[result.mode as keyof typeof messages],
          variant: result.mode === 'error' ? "destructive" : "default",
        });
      }
    } catch (error: any) {
      toast({
        title: "خطأ في إنشاء الحساب",
        description: "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "تعذر تسجيل الدخول بجوجل",
        variant: "destructive",
      });
    }
  };

  const handleFacebookLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "تعذر تسجيل الدخول بفيسبوك",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">UberFix.shop</CardTitle>
          <p className="text-muted-foreground">نظام إدارة طلبات الصيانة</p>
        </CardHeader>
        <CardContent>
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="admin@uberfix.shop"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>كلمة المرور</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="كلمة المرور"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={isLoading || isSigningUp}>
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                  تسجيل الدخول
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleSignUp}
                  disabled={isLoading || isSigningUp}
                  className="flex-1 gap-2"
                >
                  {isSigningUp && <Loader2 className="h-4 w-4 animate-spin" />}
                  <UserPlus className="h-4 w-4" />
                  إنشاء حساب
                </Button>
              </div>
            </form>
          </Form>

          <div className="mt-4 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">أو سجل الدخول باستخدام</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                className="flex-1 gap-2"
                disabled={isLoading || isSigningUp}
              >
                <FaGoogle className="h-4 w-4 text-red-500" />
                جوجل
              </Button>
              <Button 
                type="button"
                variant="outline"
                onClick={handleFacebookLogin}
                className="flex-1 gap-2"
                disabled={isLoading || isSigningUp}
              >
                <FaFacebook className="h-4 w-4 text-blue-600" />
                فيسبوك
              </Button>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              <strong>خطوات البدء:</strong><br />
              1. اضغط "إنشاء حساب" لإنشاء حساب جديد<br />
              2. ثم سجل الدخول بنفس البيانات<br />
              <strong>مثال:</strong> admin@uberfix.shop
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}