# دورة حياة طلب الصيانة الكاملة

## المراحل الأساسية (Workflow Stages)

### 1. draft (مسودة)
- الطلب قيد الإنشاء
- لم يتم الإرسال بعد
- يمكن التعديل بحرية

### 2. submitted (تم الإرسال)
- تم إرسال الطلب من العميل
- في انتظار المراجعة
- **الحدث**: إنشاء حدث lifecycle: `status_change` - `submitted`

### 3. under_review (قيد المراجعة)
- تم استلام الطلب من قبل الإدارة
- جاري تقييم الطلب
- تحديد نوع الخدمة المطلوبة
- **الحدث**: `status_change` - `under_review`

### 4. approved (تمت الموافقة)
- تمت الموافقة على الطلب
- جاري تعيين فني
- **الحدث**: `status_change` - `approved`
- **الموافقة**: إنشاء سجل في `request_approvals` - نوع `request`

### 5. assigned (تم التعيين)
- تم تعيين فني للطلب
- في انتظار قبول الفني
- **الحدث**: `assignment` - `assigned`
- **الإشعار**: إرسال إشعار للفني المعين

### 6. accepted (تم القبول)
- قبل الفني الطلب
- جاري التحضير للزيارة
- **الحدث**: `status_change` - `accepted`

### 7. scheduled (تم الجدولة)
- تم تحديد موعد الزيارة
- **الحدث**: `scheduling` - `scheduled`
- **البيانات**: تاريخ ووقت الموعد

### 8. in_progress (جاري التنفيذ)
- الفني في الموقع
- جاري العمل
- **الحدث**: `status_change` - `in_progress`

### 9. additional_materials_needed (مواد إضافية مطلوبة)
- تم اكتشاف الحاجة لمواد إضافية
- في انتظار موافقة العميل
- **الحدث**: `materials_request` - `additional_materials_needed`

### 10. materials_approved (تمت الموافقة على المواد)
- وافق العميل على المواد الإضافية
- **الحدث**: `approval` - `materials_approved`
- **الموافقة**: سجل في `request_approvals` - نوع `materials`

### 11. pending_inspection (في انتظار الفحص)
- تم الانتهاء من العمل
- في انتظار فحص الجودة
- **الحدث**: `status_change` - `pending_inspection`

### 12. inspection_passed (نجح الفحص)
- نجح العمل في الفحص
- جاهز للإغلاق
- **الحدث**: `inspection` - `inspection_passed`

### 13. completed (مكتمل)
- تم إكمال العمل بنجاح
- في انتظار التقييم
- **الحدث**: `status_change` - `completed`
- **الموافقة**: سجل في `request_approvals` - نوع `completion`

### 14. billed (تم إصدار الفاتورة)
- تم إصدار الفاتورة
- في انتظار الدفع
- **الحدث**: `billing` - `billed`

### 15. paid (تم الدفع)
- تم استلام الدفع
- **الحدث**: `payment` - `paid`
- **الموافقة**: سجل في `request_approvals` - نوع `billing`

### 16. closed (مغلق)
- تم إغلاق الطلب بنجاح
- يمكن الأرشفة
- **الحدث**: `status_change` - `closed`

### 17. archived (مؤرشف)
- تم أرشفة الطلب
- خارج العمليات النشطة
- **الحدث**: `archival` - `archived`
- **البيانات**: تاريخ الأرشفة في `archived_at`

## الحالات الاستثنائية

### cancelled (ملغي)
- تم إلغاء الطلب من قبل العميل أو الإدارة
- **الحدث**: `cancellation` - `cancelled`

### rejected (مرفوض)
- رفض الفني الطلب
- رفض العميل التكلفة
- **الحدث**: `rejection` - `rejected`

### on_hold (متوقف مؤقتاً)
- تم إيقاف العمل مؤقتاً
- **الحدث**: `status_change` - `on_hold`

## الأحداث المطلوبة في كل مرحلة

| المرحلة | نوع الحدث | التفاصيل |
|---------|-----------|----------|
| submitted | status_change | تم إرسال الطلب |
| under_review | status_change | قيد المراجعة |
| approved | status_change + approval | تمت الموافقة |
| assigned | assignment | تم تعيين فني |
| accepted | status_change | قبل الفني |
| scheduled | scheduling | تم تحديد موعد |
| in_progress | status_change | بدء العمل |
| additional_materials_needed | materials_request | طلب مواد |
| materials_approved | approval | موافقة مواد |
| pending_inspection | status_change | انتظار فحص |
| inspection_passed | inspection | نجح الفحص |
| completed | status_change + approval | اكتمل |
| billed | billing | فاتورة |
| paid | payment + approval | دفع |
| closed | status_change | إغلاق |
| archived | archival | أرشفة |

## الجداول المستخدمة

1. **maintenance_requests**: الجدول الرئيسي
2. **request_lifecycle**: سجل الأحداث
3. **request_approvals**: الموافقات
4. **work_tasks**: مهام العمل
5. **request_reviews**: التقييمات
6. **notifications**: الإشعارات

## SLA (اتفاقيات مستوى الخدمة)

- **sla_accept_due**: موعد قبول الطلب
- **sla_arrive_due**: موعد الوصول للموقع
- **sla_complete_due**: موعد إكمال العمل
