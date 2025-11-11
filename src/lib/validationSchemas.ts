import { z } from "zod";

// ==================== Common Validation Patterns ====================

/**
 * Egyptian Phone Number Validation
 * Format: 01xxxxxxxxx (11 digits starting with 01)
 */
export const egyptianPhoneSchema = z
  .string()
  .trim()
  .regex(/^01[0-2,5]{1}[0-9]{8}$/, {
    message: "رقم هاتف مصري غير صحيح. يجب أن يبدأ بـ 01 ويحتوي على 11 رقم",
  })
  .min(11, "رقم الهاتف يجب أن يحتوي على 11 رقم")
  .max(11, "رقم الهاتف يجب أن يحتوي على 11 رقم");

/**
 * International Phone Number Validation (WhatsApp format)
 * Format: +[country code][number] (10-15 digits total)
 */
export const internationalPhoneSchema = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{9,14}$/, {
    message: "رقم الهاتف الدولي غير صحيح. يجب أن يبدأ بـ + متبوعاً برمز الدولة والرقم (مثال: +201234567890)",
  })
  .min(10, "رقم الهاتف قصير جداً")
  .max(16, "رقم الهاتف طويل جداً");

/**
 * Email Validation with sanitization
 */
export const emailSchema = z
  .string()
  .trim()
  .email({ message: "البريد الإلكتروني غير صحيح" })
  .max(255, "البريد الإلكتروني طويل جداً")
  .transform((email) => email.toLowerCase());

/**
 * Name Validation (Arabic & English)
 */
export const nameSchema = z
  .string()
  .trim()
  .min(2, "الاسم قصير جداً (حد أدنى حرفان)")
  .max(100, "الاسم طويل جداً (حد أقصى 100 حرف)")
  .regex(/^[\u0600-\u06FFa-zA-Z\s]+$/, {
    message: "الاسم يجب أن يحتوي على حروف عربية أو إنجليزية فقط",
  });

/**
 * Password Validation
 */
export const passwordSchema = z
  .string()
  .min(8, "كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل")
  .max(100, "كلمة المرور طويلة جداً")
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم",
  });

/**
 * Short Description/Title (50-200 chars)
 */
export const titleSchema = z
  .string()
  .trim()
  .min(3, "العنوان قصير جداً (حد أدنى 3 أحرف)")
  .max(200, "العنوان طويل جداً (حد أقصى 200 حرف)");

/**
 * Long Description/Text (up to 5000 chars)
 */
export const descriptionSchema = z
  .string()
  .trim()
  .min(10, "الوصف قصير جداً (حد أدنى 10 أحرف)")
  .max(5000, "الوصف طويل جداً (حد أقصى 5000 حرف)");

/**
 * Short Text/Notes (up to 1000 chars)
 */
export const notesSchema = z
  .string()
  .trim()
  .max(1000, "الملاحظات طويلة جداً (حد أقصى 1000 حرف)")
  .optional()
  .or(z.literal(""));

/**
 * Address Validation
 */
export const addressSchema = z
  .string()
  .trim()
  .min(10, "العنوان قصير جداً (حد أدنى 10 أحرف)")
  .max(500, "العنوان طويل جداً (حد أقصى 500 حرف)");

/**
 * Positive Number (for prices, rates, etc.)
 */
export const positiveNumberSchema = z
  .number()
  .positive("يجب أن يكون الرقم موجباً")
  .finite("الرقم غير صحيح");

/**
 * Positive Integer (for counts, years, etc.)
 */
export const positiveIntegerSchema = z
  .number()
  .int("يجب أن يكون الرقم صحيحاً")
  .positive("يجب أن يكون الرقم موجباً")
  .finite("الرقم غير صحيح");

/**
 * URL Validation
 */
export const urlSchema = z
  .string()
  .trim()
  .url({ message: "رابط غير صحيح" })
  .max(2000, "الرابط طويل جداً")
  .optional()
  .or(z.literal(""));

/**
 * WhatsApp Message Validation (max 4096 characters as per WhatsApp limit)
 */
export const whatsappMessageSchema = z
  .string()
  .trim()
  .min(1, "الرسالة فارغة")
  .max(4096, "الرسالة طويلة جداً (حد أقصى 4096 حرف لـ WhatsApp)");

/**
 * UUID Validation
 */
export const uuidSchema = z
  .string()
  .uuid({ message: "معرّف غير صحيح" })
  .optional()
  .or(z.literal(""));

// ==================== Form-Specific Schemas ====================

/**
 * WhatsApp Message Form Schema
 */
export const whatsappFormSchema = z.object({
  to: internationalPhoneSchema,
  message: whatsappMessageSchema,
  media_url: urlSchema,
});

/**
 * Appointment Form Schema
 */
export const appointmentFormSchema = z.object({
  title: titleSchema,
  customer_name: nameSchema,
  customer_phone: egyptianPhoneSchema.optional().or(z.literal("")),
  customer_email: emailSchema.optional().or(z.literal("")),
  appointment_date: z.date(),
  appointment_time: z.string().min(1, "يرجى اختيار وقت الموعد"),
  duration_minutes: z.number().int().positive().min(15).max(480),
  property_id: uuidSchema,
  vendor_id: uuidSchema,
  location: z.string().trim().max(500).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  notes: notesSchema,
});

/**
 * Vendor Form Schema
 */
export const vendorFormSchema = z.object({
  name: nameSchema,
  company_name: z.string().trim().max(200).optional().or(z.literal("")),
  specialization: z.array(z.string()).min(1, "يرجى اختيار تخصص واحد على الأقل"),
  phone: egyptianPhoneSchema.optional().or(z.literal("")),
  email: emailSchema.optional().or(z.literal("")),
  address: z.string().trim().max(500).optional().or(z.literal("")),
  unit_rate: z.string().optional().or(z.literal("")),
  experience_years: z.string().optional().or(z.literal("")),
  notes: notesSchema,
});

/**
 * Emergency Service Form Schema
 */
export const emergencyServiceSchema = z.object({
  name: nameSchema,
  phone: egyptianPhoneSchema,
  address: addressSchema,
  description: descriptionSchema,
  priority: z.enum(["low", "medium", "high", "urgent"]),
});

/**
 * Login Form Schema
 */
export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

/**
 * Register Form Schema
 */
export const registerFormSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
    full_name: nameSchema,
    phone: egyptianPhoneSchema.optional().or(z.literal("")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمات المرور غير متطابقة",
    path: ["confirmPassword"],
  });

/**
 * Project Form Schema
 */
export const projectFormSchema = z.object({
  name: titleSchema,
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  location: z.string().trim().max(500).optional().or(z.literal("")),
  budget: z.string().optional().or(z.literal("")),
  start_date: z.string().optional().or(z.literal("")),
  end_date: z.string().optional().or(z.literal("")),
});

/**
 * Maintenance Request Form Schema
 */
export const maintenanceRequestFormSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  client_name: nameSchema,
  client_phone: egyptianPhoneSchema,
  client_email: emailSchema.optional().or(z.literal("")),
  location: addressSchema,
  service_type: z.enum([
    "plumbing",
    "electrical",
    "hvac",
    "carpentry",
    "painting",
    "cleaning",
    "general",
  ]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  preferred_date: z.string().optional().or(z.literal("")),
  preferred_time: z.string().optional().or(z.literal("")),
  customer_notes: z.string().trim().max(1000).optional().or(z.literal("")),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  property_id: uuidSchema.refine((val) => val && val !== "", {
    message: "يرجى اختيار العقار",
  }),
});

/**
 * Review Form Schema
 */
export const reviewFormSchema = z.object({
  rating: z
    .number()
    .int("التقييم يجب أن يكون رقماً صحيحاً")
    .min(1, "التقييم يجب أن يكون من 1 إلى 5")
    .max(5, "التقييم يجب أن يكون من 1 إلى 5"),
  comment: z
    .string()
    .trim()
    .min(10, "التعليق قصير جداً (حد أدنى 10 أحرف)")
    .max(1000, "التعليق طويل جداً (حد أقصى 1000 حرف)"),
  request_id: uuidSchema.refine((val) => val && val !== "", {
    message: "معرف الطلب مطلوب",
  }),
});

/**
 * Property Form Schema
 */
export const propertyFormSchema = z.object({
  code: z.string()
    .trim()
    .min(1, { message: "كود العقار مطلوب" })
    .max(50, { message: "كود العقار يجب ألا يتجاوز 50 حرف" }),
  name: titleSchema,
  type: z.string()
    .refine(val => ["residential", "commercial", "industrial", "office", "retail", "mixed_use"].includes(val), {
      message: "نوع العقار غير صحيح",
    }),
  city_id: z.string()
    .min(1, { message: "المدينة مطلوبة" }),
  district_id: z.string()
    .min(1, { message: "الحي مطلوب" }),
  address: addressSchema,
  area: z.number()
    .positive({ message: "المساحة يجب أن تكون رقم موجب" })
    .optional(),
  rooms: z.number()
    .int({ message: "عدد الغرف يجب أن يكون رقم صحيح" })
    .nonnegative({ message: "عدد الغرف يجب أن يكون 0 أو أكثر" })
    .optional(),
  bathrooms: z.number()
    .int({ message: "عدد الحمامات يجب أن يكون رقم صحيح" })
    .nonnegative({ message: "عدد الحمامات يجب أن يكون 0 أو أكثر" })
    .optional(),
  floors: z.number()
    .int({ message: "عدد الطوابق يجب أن يكون رقم صحيح" })
    .positive({ message: "عدد الطوابق يجب أن يكون رقم موجب" })
    .optional(),
  description: z.string()
    .trim()
    .max(2000, { message: "الوصف يجب ألا يتجاوز 2000 حرف" })
    .optional()
    .or(z.literal("")),
});

// ==================== Utility Functions ====================

/**
 * Sanitize HTML to prevent XSS attacks
 */
export const sanitizeHtml = (html: string): string => {
  return html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Validate and sanitize phone number for database storage
 */
export const sanitizePhone = (phone: string): string => {
  return phone.trim().replace(/[^\d+]/g, "");
};

/**
 * Validate and sanitize email for database storage
 */
export const sanitizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};
