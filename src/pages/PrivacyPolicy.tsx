import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">Az</span>
              </div>
              <span className="text-xl font-bold">UberFix.shop</span>
            </div>
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowRight className="h-4 w-4 ml-2" />
              العودة
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">سياسة الخصوصية</h1>
        
        <div className="space-y-8 text-muted-foreground">
          <section>
            <p className="text-sm text-muted-foreground mb-4">آخر تحديث: {new Date().toLocaleDateString('ar-SA')}</p>
            <p className="leading-relaxed">
              نحن في UberFix.shop نلتزم بحماية خصوصيتك وأمان بياناتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتك عند استخدام منصتنا لإدارة الصيانة.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. المعلومات التي نجمعها</h2>
            <div className="space-y-3">
              <h3 className="text-xl font-medium text-foreground">معلومات الحساب:</h3>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>الاسم الكامل</li>
                <li>عنوان البريد الإلكتروني</li>
                <li>رقم الهاتف</li>
                <li>معلومات الشركة (للحسابات التجارية)</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mt-4">معلومات الاستخدام:</h3>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>طلبات الصيانة والمعلومات المرتبطة بها</li>
                <li>معلومات العقارات والمرافق</li>
                <li>سجل التواصل والرسائل</li>
                <li>بيانات الموقع (عند الموافقة)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. كيفية استخدام المعلومات</h2>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li>تقديم خدمات إدارة الصيانة والعقارات</li>
              <li>معالجة طلبات الصيانة وتعيين الفنيين</li>
              <li>التواصل معك بشأن الطلبات والتحديثات</li>
              <li>تحسين جودة الخدمة وتجربة المستخدم</li>
              <li>إرسال إشعارات مهمة عن الخدمة</li>
              <li>الامتثال للمتطلبات القانونية والتنظيمية</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. مشاركة المعلومات</h2>
            <p className="leading-relaxed mb-3">نحن لا نبيع معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك مع:</p>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li>الفنيين المعينين لتنفيذ طلبات الصيانة</li>
              <li>مقدمي خدمات الدفع لمعالجة المدفوعات</li>
              <li>مقدمي الخدمات السحابية لاستضافة البيانات</li>
              <li>السلطات القانونية عند الضرورة القانونية</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. أمان البيانات</h2>
            <p className="leading-relaxed">
              نستخدم إجراءات أمنية صناعية قياسية لحماية معلوماتك، بما في ذلك:
            </p>
            <ul className="list-disc list-inside space-y-2 mr-4 mt-3">
              <li>تشفير SSL/TLS لنقل البيانات</li>
              <li>تشفير البيانات المخزنة</li>
              <li>جدران حماية وأنظمة كشف التسلل</li>
              <li>مراجعات أمنية منتظمة</li>
              <li>قيود الوصول للموظفين</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. حقوقك</h2>
            <p className="leading-relaxed mb-3">لديك الحق في:</p>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li>الوصول إلى بياناتك الشخصية</li>
              <li>تصحيح البيانات غير الدقيقة</li>
              <li>طلب حذف بياناتك</li>
              <li>الاعتراض على معالجة بياناتك</li>
              <li>طلب نقل بياناتك</li>
              <li>سحب الموافقة في أي وقت</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. ملفات تعريف الارتباط (Cookies)</h2>
            <p className="leading-relaxed">
              نستخدم ملفات تعريف الارتباط لتحسين تجربة المستخدم، وتذكر تفضيلاتك، وتحليل استخدام الموقع. يمكنك التحكم في ملفات تعريف الارتباط من خلال إعدادات المتصفح.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. الاحتفاظ بالبيانات</h2>
            <p className="leading-relaxed">
              نحتفظ بمعلوماتك الشخصية طالما كان حسابك نشطاً أو حسب الحاجة لتقديم الخدمات. قد نحتفظ ببعض البيانات لفترة أطول للامتثال للالتزامات القانونية أو لحل النزاعات.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. خصوصية الأطفال</h2>
            <p className="leading-relaxed">
              خدماتنا غير موجهة للأطفال دون سن 18 عاماً. نحن لا نجمع معلومات شخصية من الأطفال عن قصد.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. التحديثات على السياسة</h2>
            <p className="leading-relaxed">
              قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنخطرك بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال إشعار على المنصة.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. اتصل بنا</h2>
            <p className="leading-relaxed mb-3">
              إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه أو ممارسات البيانات لدينا، يرجى الاتصال بنا:
            </p>
            <ul className="space-y-2">
              <li><strong>البريد الإلكتروني:</strong> privacy@uberfix.shop</li>
              <li><strong>الهاتف:</strong> +966 12 345 6789</li>
              <li><strong>العنوان:</strong> الرياض، المملكة العربية السعودية</li>
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <Button onClick={() => navigate(-1)} size="lg">
            <ArrowRight className="h-4 w-4 ml-2" />
            العودة إلى الموقع
          </Button>
        </div>
      </main>
    </div>
  );
}
