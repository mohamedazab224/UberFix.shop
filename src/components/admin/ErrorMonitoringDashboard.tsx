import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';

interface ErrorLog {
  id: string;
  message: string;
  stack?: string;
  url?: string;
  user_id?: string;
  user_agent?: string;
  level: 'error' | 'warning' | 'info';
  metadata?: any;
  error_hash?: string;
  count: number;
  first_seen_at: string;
  last_seen_at: string;
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

export function ErrorMonitoringDashboard() {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unresolved'>('unresolved');
  const { toast } = useToast();

  useEffect(() => {
    fetchErrors();
  }, [filter]);

  const fetchErrors = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('error_logs')
        .select('*')
        .order('last_seen_at', { ascending: false })
        .limit(100);

      if (filter === 'unresolved') {
        query = query.is('resolved_at', null);
      }

      const { data, error } = await query;

      if (error) throw error;
      setErrors((data || []) as ErrorLog[]);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل سجل الأخطاء",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsResolved = async (errorId: string) => {
    try {
      const { error } = await supabase
        .from('error_logs')
        .update({ 
          resolved_at: new Date().toISOString(),
          resolved_by: (await supabase.auth.getUser()).data.user?.id 
        })
        .eq('id', errorId);

      if (error) throw error;
      
      toast({
        title: "تم",
        description: "تم وضع علامة على الخطأ كمحلول",
      });
      
      fetchErrors();
    } catch (error) {
      console.error('Error marking as resolved:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة الخطأ",
        variant: "destructive",
      });
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'info':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="جاري تحميل سجل الأخطاء..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">مراقبة الأخطاء</h1>
          <p className="text-muted-foreground">
            تتبع وإدارة أخطاء النظام
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={filter === 'unresolved' ? 'default' : 'outline'}
            onClick={() => setFilter('unresolved')}
          >
            غير محلولة
          </Button>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            جميع الأخطاء
          </Button>
        </div>
      </div>

      {errors.length === 0 ? (
        <EmptyState
          icon={<CheckCircle className="h-8 w-8 text-green-500" />}
          title="لا توجد أخطاء"
          description={
            filter === 'unresolved' 
              ? "جميع الأخطاء تم حلها!" 
              : "لم يتم تسجيل أي أخطاء حتى الآن"
          }
        />
      ) : (
        <div className="space-y-4">
          {errors.map((error) => (
            <Card key={error.id} className={`${error.resolved_at ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getLevelIcon(error.level)}
                    <CardTitle className="text-lg">{error.message}</CardTitle>
                    <Badge variant={getLevelColor(error.level) as any}>
                      {error.level}
                    </Badge>
                    {error.count > 1 && (
                      <Badge variant="secondary" className="gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {error.count}x
                      </Badge>
                    )}
                    {error.resolved_at && (
                      <Badge variant="outline" className="text-green-600">
                        محلول
                      </Badge>
                    )}
                  </div>
                  
                  {!error.resolved_at && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAsResolved(error.id)}
                    >
                      وضع علامة كمحلول
                    </Button>
                  )}
                </div>
                
                <CardDescription className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span>أول ظهور: {new Date(error.first_seen_at).toLocaleString('ar-EG')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>آخر ظهور: {new Date(error.last_seen_at).toLocaleString('ar-EG')}</span>
                  </div>
                  {error.url && (
                    <div className="flex items-center gap-2">
                      <span>الصفحة: {new URL(error.url).pathname}</span>
                    </div>
                  )}
                  {error.user_id && (
                    <div className="flex items-center gap-2">
                      <span>معرف المستخدم: {error.user_id.substring(0, 8)}...</span>
                    </div>
                  )}
                  {error.error_hash && (
                    <div className="flex items-center gap-2 font-mono">
                      <span>Hash: {error.error_hash.substring(0, 12)}</span>
                    </div>
                  )}
                </CardDescription>
              </CardHeader>
              
              {(error.stack || error.metadata) && (
                <CardContent>
                  {error.stack && (
                    <details className="mb-3">
                      <summary className="cursor-pointer font-medium text-sm mb-2">
                        تفاصيل الخطأ
                      </summary>
                      <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                        {error.stack}
                      </pre>
                    </details>
                  )}
                  
                  {error.metadata && (
                    <details>
                      <summary className="cursor-pointer font-medium text-sm mb-2">
                        بيانات إضافية
                      </summary>
                      <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                        {JSON.stringify(error.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}