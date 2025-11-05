import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { importBranchesFromCSV } from '@/utils/importBranches';

export default function ImportBranches() {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ success: number; errors: number; total: number } | null>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      setProgress(0);
      setResult(null);

      // قراءة الملف
      const text = await file.text();

      // استيراد البيانات
      const importResult = await importBranchesFromCSV(text, (current, total) => {
        setProgress((current / total) * 100);
      });

      setResult(importResult);

      toast({
        title: "✅ اكتمل الاستيراد",
        description: `تم استيراد ${importResult.success} فرع بنجاح من ${importResult.total}`,
      });

    } catch (error) {
      console.error('خطأ في الاستيراد:', error);
      toast({
        title: "❌ فشل الاستيراد",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">استيراد الفروع</h1>
          <p className="text-muted-foreground">
            رفع ملف CSV لاستيراد بيانات الفروع مع تحويل العناوين إلى إحداثيات على الخريطة
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              رفع ملف CSV
            </CardTitle>
            <CardDescription>
              اختر ملف CSV يحتوي على بيانات الفروع (id, name, location, phone, email, map_url...)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={importing}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-4">
                  <Upload className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">انقر لاختيار ملف CSV</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      سيتم تحويل العناوين إلى إحداثيات تلقائياً
                    </p>
                  </div>
                  <Button disabled={importing}>
                    {importing ? 'جارِ الاستيراد...' : 'اختر ملف'}
                  </Button>
                </div>
              </label>
            </div>

            {importing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>جارِ الاستيراد...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {result && (
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-green-700 dark:text-green-400">
                      تم الاستيراد بنجاح
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                      {result.success} من {result.total} فرع
                    </p>
                  </div>
                </div>

                {result.errors > 0 && (
                  <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-yellow-700 dark:text-yellow-400">
                        بعض الأخطاء
                      </p>
                      <p className="text-sm text-yellow-600 dark:text-yellow-500 mt-1">
                        {result.errors} فرع فشل استيراده - راجع Console للتفاصيل
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>تعليمات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• الملف يجب أن يكون بصيغة CSV</p>
            <p>• يجب أن يحتوي على الأعمدة: id, name, location, phone, email, map_url</p>
            <p>• سيتم استخراج العناوين من map_url وتحويلها إلى إحداثيات GPS</p>
            <p>• قد يستغرق الاستيراد بعض الوقت حسب عدد الفروع</p>
            <p>• سيتم حفظ الإحداثيات في حقل location بصيغة JSON</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
