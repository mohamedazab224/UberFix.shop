# دليل نشر تطبيق UberFix على Google Play

## 📱 الخطوات المطلوبة للنشر على Google Play

### 1️⃣ تحضير المشروع محلياً

```bash
# 1. انقل المشروع إلى GitHub (استخدم زر "Export to Github" في Lovable)
# 2. اسحب المشروع من GitHub
git clone [your-repo-url]
cd [project-name]

# 3. ثبت المكتبات
npm install

# 4. أضف منصة Android
npx cap add android

# 5. بناء المشروع
npm run build

# 6. مزامنة مع Android
npx cap sync android
```

### 2️⃣ إعدادات Android الأساسية

افتح المشروع في Android Studio:
```bash
npx cap open android
```

#### تحديث `android/app/build.gradle`:

```gradle
android {
    namespace "com.alazab.maintenance"
    compileSdkVersion 34  // أحدث SDK
    
    defaultConfig {
        applicationId "com.alazab.maintenance"
        minSdkVersion 22
        targetSdkVersion 34  // مطلوب من Google Play
        versionCode 1  // زود هذا الرقم مع كل تحديث
        versionName "1.0.0"
    }
    
    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 3️⃣ الأيقونات وشاشة البداية

#### أيقونة التطبيق:
- ضع الأيقونات في: `android/app/src/main/res/`
- الأحجام المطلوبة:
  - `mipmap-mdpi/ic_launcher.png` (48x48)
  - `mipmap-hdpi/ic_launcher.png` (72x72)
  - `mipmap-xhdpi/ic_launcher.png` (96x96)
  - `mipmap-xxhdpi/ic_launcher.png` (144x144)
  - `mipmap-xxxhdpi/ic_launcher.png` (192x192)

يمكنك إنشاء جميع الأحجام من: https://appicon.co/

#### شاشة البداية:
- موجودة بالفعل في إعدادات Capacitor ✅

### 4️⃣ الأذونات المطلوبة

تحديث `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- الأذونات الأساسية لتطبيق الصيانة -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.CALL_PHONE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="false">
        
        <!-- باقي الإعدادات -->
    </application>
</manifest>
```

### 5️⃣ بناء ملف APK/AAB للنشر

#### توقيع التطبيق:

1. **إنشاء مفتاح التوقيع:**
```bash
keytool -genkey -v -keystore uberfix-release-key.keystore -alias uberfix -keyalg RSA -keysize 2048 -validity 10000
```

2. **إنشاء ملف التوقيع:**
أنشئ ملف `android/key.properties`:
```properties
storePassword=your-store-password
keyPassword=your-key-password
keyAlias=uberfix
storeFile=/path/to/uberfix-release-key.keystore
```

3. **تحديث `android/app/build.gradle`:**
```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

4. **بناء AAB للنشر:**
```bash
cd android
./gradlew bundleRelease
```

ملف AAB سيكون في: `android/app/build/outputs/bundle/release/app-release.aab`

### 6️⃣ سياسة الخصوصية

**مطلوب من Google Play** - يجب أن يكون لديك رابط عام لسياسة الخصوصية.

يمكنك:
1. نشرها على موقعك
2. استخدام GitHub Pages
3. استخدام منصات مثل: https://www.freeprivacypolicy.com/

### 7️⃣ إنشاء حساب Google Play Console

1. اذهب إلى: https://play.google.com/console
2. سجل كمطور (رسوم لمرة واحدة: $25)
3. أنشئ تطبيق جديد

### 8️⃣ معلومات المتجر المطلوبة

عند رفع التطبيق، ستحتاج:

#### النصوص:
- **اسم التطبيق:** UberFix - منصة الصيانة الذكية
- **الوصف القصير** (80 حرف):
  "منصة ذكية لربط العملاء بفنيي الصيانة في مصر - صيانة سريعة وموثوقة"

- **الوصف الطويل** (4000 حرف):
  اكتب وصف تفصيلي يشمل:
  - ما هو التطبيق
  - المميزات الرئيسية
  - كيفية الاستخدام
  - فوائد للعملاء والفنيين

#### الصور:
- **أيقونة التطبيق:** 512x512 بكسل (PNG)
- **صورة مميزة:** 1024x500 بكسل
- **لقطات شاشة:**
  - للهواتف: على الأقل 2 (320-3840 بكسل)
  - للأجهزة اللوحية: على الأقل 2 (1200-7680 بكسل)

### 9️⃣ التصنيف والفئة

- **الفئة:** Business / Productivity
- **التصنيف:** حدد الفئة العمرية المناسبة
- **البلد:** مصر والدول المستهدفة

### 🔟 الاختبار الداخلي/المغلق

قبل النشر العام:
1. ابدأ باختبار داخلي (Internal Testing)
2. ثم اختبار مغلق (Closed Testing) مع مجموعة محدودة
3. ثم اختبار مفتوح (Open Testing) إذا أردت
4. وأخيراً النشر للجمهور (Production)

## ✅ قائمة المراجعة النهائية

- [ ] تحديث versionCode و versionName
- [ ] targetSdkVersion = 34 (أو الأحدث)
- [ ] جميع الأيقونات بالأحجام الصحيحة
- [ ] توقيع التطبيق بمفتاح آمن
- [ ] سياسة خصوصية متاحة على رابط عام
- [ ] لقطات شاشة (2-8 لكل نوع جهاز)
- [ ] وصف كامل ومفصل
- [ ] اختبار التطبيق بالكامل
- [ ] إزالة أي بيانات تجريبية
- [ ] التأكد من عمل جميع الميزات
- [ ] فحص الأذونات المطلوبة فقط

## 📞 مساعدة إضافية

- دليل Google Play الرسمي: https://developer.android.com/distribute/console
- متطلبات النشر: https://support.google.com/googleplay/android-developer/answer/9859152

## ⚠️ ملاحظات هامة

1. **وقت المراجعة:** قد يستغرق من بضع ساعات إلى عدة أيام
2. **التحديثات:** كل تحديث يحتاج versionCode أكبر
3. **النسخة التجريبية:** استخدم Internal Testing أولاً
4. **السياسات:** التزم بسياسات Google Play لتجنب الرفض أو الحظر
