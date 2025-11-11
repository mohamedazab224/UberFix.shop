import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, CheckCircle2, UserCheck, Calendar, Wrench, 
  Package, ClipboardCheck, FileCheck, DollarSign, 
  Archive, XCircle, Clock, ArrowRight 
} from "lucide-react";

interface LifecycleStage {
  stage: string;
  label: string;
  description: string;
  icon: any;
  color: string;
  actions: string[];
  nextStages: string[];
}

const lifecycleStages: LifecycleStage[] = [
  {
    stage: "draft",
    label: "مسودة",
    description: "الطلب قيد الإنشاء",
    icon: FileText,
    color: "bg-gray-500",
    actions: ["تعديل", "إرسال", "حذف"],
    nextStages: ["submitted", "cancelled"]
  },
  {
    stage: "submitted",
    label: "تم الإرسال",
    description: "تم إرسال الطلب وفي انتظار المراجعة",
    icon: FileText,
    color: "bg-blue-500",
    actions: ["مراجعة", "رفض"],
    nextStages: ["under_review", "rejected"]
  },
  {
    stage: "under_review",
    label: "قيد المراجعة",
    description: "جاري مراجعة الطلب من قبل الإدارة",
    icon: ClipboardCheck,
    color: "bg-yellow-500",
    actions: ["موافقة", "رفض", "طلب معلومات إضافية"],
    nextStages: ["approved", "rejected", "on_hold"]
  },
  {
    stage: "approved",
    label: "تمت الموافقة",
    description: "تمت الموافقة على الطلب وجاري تعيين فني",
    icon: CheckCircle2,
    color: "bg-green-500",
    actions: ["تعيين فني"],
    nextStages: ["assigned"]
  },
  {
    stage: "assigned",
    label: "تم التعيين",
    description: "تم تعيين فني للطلب",
    icon: UserCheck,
    color: "bg-indigo-500",
    actions: ["قبول", "رفض"],
    nextStages: ["accepted", "rejected"]
  },
  {
    stage: "accepted",
    label: "تم القبول",
    description: "قبل الفني الطلب",
    icon: CheckCircle2,
    color: "bg-teal-500",
    actions: ["جدولة موعد"],
    nextStages: ["scheduled"]
  },
  {
    stage: "scheduled",
    label: "تم الجدولة",
    description: "تم تحديد موعد الزيارة",
    icon: Calendar,
    color: "bg-purple-500",
    actions: ["بدء العمل", "إعادة الجدولة"],
    nextStages: ["in_progress", "scheduled"]
  },
  {
    stage: "in_progress",
    label: "جاري التنفيذ",
    description: "الفني في الموقع وجاري العمل",
    icon: Wrench,
    color: "bg-orange-500",
    actions: ["إتمام", "طلب مواد إضافية", "إيقاف مؤقت"],
    nextStages: ["pending_inspection", "additional_materials_needed", "on_hold"]
  },
  {
    stage: "additional_materials_needed",
    label: "مواد إضافية مطلوبة",
    description: "تم اكتشاف الحاجة لمواد إضافية",
    icon: Package,
    color: "bg-amber-500",
    actions: ["موافقة العميل", "رفض"],
    nextStages: ["materials_approved", "cancelled"]
  },
  {
    stage: "materials_approved",
    label: "تمت الموافقة على المواد",
    description: "وافق العميل على المواد الإضافية",
    icon: CheckCircle2,
    color: "bg-green-600",
    actions: ["متابعة العمل"],
    nextStages: ["in_progress"]
  },
  {
    stage: "pending_inspection",
    label: "في انتظار الفحص",
    description: "تم الانتهاء من العمل وفي انتظار الفحص",
    icon: ClipboardCheck,
    color: "bg-cyan-500",
    actions: ["فحص", "إعادة العمل"],
    nextStages: ["inspection_passed", "in_progress"]
  },
  {
    stage: "inspection_passed",
    label: "نجح الفحص",
    description: "نجح العمل في فحص الجودة",
    icon: FileCheck,
    color: "bg-emerald-500",
    actions: ["إتمام"],
    nextStages: ["completed"]
  },
  {
    stage: "completed",
    label: "مكتمل",
    description: "تم إكمال العمل بنجاح",
    icon: CheckCircle2,
    color: "bg-green-700",
    actions: ["إصدار فاتورة", "تقييم"],
    nextStages: ["billed"]
  },
  {
    stage: "billed",
    label: "تم إصدار الفاتورة",
    description: "تم إصدار الفاتورة وفي انتظار الدفع",
    icon: DollarSign,
    color: "bg-blue-600",
    actions: ["تسجيل الدفع"],
    nextStages: ["paid"]
  },
  {
    stage: "paid",
    label: "تم الدفع",
    description: "تم استلام الدفع",
    icon: DollarSign,
    color: "bg-green-800",
    actions: ["إغلاق"],
    nextStages: ["closed"]
  },
  {
    stage: "closed",
    label: "مغلق",
    description: "تم إغلاق الطلب بنجاح",
    icon: CheckCircle2,
    color: "bg-slate-700",
    actions: ["أرشفة"],
    nextStages: ["archived"]
  },
  {
    stage: "archived",
    label: "مؤرشف",
    description: "تم أرشفة الطلب",
    icon: Archive,
    color: "bg-slate-900",
    actions: [],
    nextStages: []
  },
  {
    stage: "on_hold",
    label: "متوقف مؤقتاً",
    description: "تم إيقاف العمل مؤقتاً",
    icon: Clock,
    color: "bg-yellow-600",
    actions: ["استئناف", "إلغاء"],
    nextStages: ["in_progress", "cancelled"]
  },
  {
    stage: "cancelled",
    label: "ملغي",
    description: "تم إلغاء الطلب",
    icon: XCircle,
    color: "bg-red-600",
    actions: ["أرشفة"],
    nextStages: ["archived"]
  },
  {
    stage: "rejected",
    label: "مرفوض",
    description: "تم رفض الطلب",
    icon: XCircle,
    color: "bg-red-500",
    actions: ["مراجعة", "أرشفة"],
    nextStages: ["under_review", "archived"]
  }
];

export default function RequestLifecycleJourney() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          دورة حياة طلب الصيانة الكاملة
        </h1>
        <p className="text-muted-foreground">
          نظرة شاملة على جميع المراحل التي يمر بها طلب الصيانة من الإرسال حتى الأرشفة
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lifecycleStages.map((stage, index) => {
          const Icon = stage.icon;
          return (
            <Card key={stage.stage} className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1 ${stage.color}`} />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${stage.color} text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{stage.label}</CardTitle>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {stage.stage}
                      </Badge>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-muted-foreground">
                    {index + 1}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {stage.description}
                </p>

                {stage.actions.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-foreground mb-2">
                      الإجراءات المتاحة:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {stage.actions.map((action) => (
                        <Badge key={action} variant="secondary" className="text-xs">
                          {action}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {stage.nextStages.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                      <ArrowRight className="h-3 w-3" />
                      المراحل التالية المحتملة:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {stage.nextStages.map((nextStage) => {
                        const next = lifecycleStages.find(s => s.stage === nextStage);
                        return (
                          <Badge 
                            key={nextStage} 
                            className={`text-xs ${next?.color} text-white border-0`}
                          >
                            {next?.label || nextStage}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>مفتاح الألوان</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-500" />
              <span className="text-sm">مسودة / تحضير</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500" />
              <span className="text-sm">قيد المعالجة</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500" />
              <span className="text-sm">في انتظار إجراء</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span className="text-sm">موافقة / نجاح</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-500" />
              <span className="text-sm">جاري التنفيذ</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500" />
              <span className="text-sm">ملغي / مرفوض</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-purple-500" />
              <span className="text-sm">مجدول</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-slate-700" />
              <span className="text-sm">مغلق / مؤرشف</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flow Diagram */}
      <Card>
        <CardHeader>
          <CardTitle>المسار الطبيعي للطلب (Happy Path)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {[
              "draft", "submitted", "under_review", "approved", "assigned", 
              "accepted", "scheduled", "in_progress", "pending_inspection", 
              "inspection_passed", "completed", "billed", "paid", "closed", "archived"
            ].map((stage, index, arr) => {
              const stageInfo = lifecycleStages.find(s => s.stage === stage);
              const Icon = stageInfo?.icon || FileText;
              return (
                <div key={stage} className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${stageInfo?.color} text-white text-xs`}>
                    <Icon className="h-3 w-3" />
                    {stageInfo?.label}
                  </div>
                  {index < arr.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
