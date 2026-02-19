import { z } from 'zod';

// Step 1: Student Details
export const step1Schema = z.object({
    name: z.string().trim().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
    email: z.string().trim().email('البريد الإلكتروني غير صحيح'),
    phone: z.string().trim().regex(/^\d{7,15}$/, 'رقم الهاتف يجب أن يكون بين 7 و 15 رقم'),
    countryCode: z.string(),
    countryId: z.number().min(1, 'الدولة مطلوبة'),
    cityId: z.number().min(1, 'المدينة مطلوبة'),
});

// Step 2: Parent Details
export const step2Schema = z.object({
    parentName: z.string().trim().min(3, 'اسم ولي الأمر مطلوب'),
    parentEmail: z.string().trim().email('بريد ولي الأمر غير صحيح'),
    parentPhone: z.string().trim().regex(/^\d{7,15}$/, 'رقم هاتف ولي الأمر يجب أن يكون بين 7 و 15 رقم'),
    parentCountryCode: z.string(),
});

// Step 3: Security & Extras
export const step3Schema = z.object({
    password: z.string()
        .min(8, '8 أحرف على الأقل')
        .regex(/[A-Z]/, 'حرف كبير (A-Z)')
        .regex(/[a-z]/, 'حرف صغير (a-z)')
        .regex(/[0-9]/, 'رقم (0-9)')
        .regex(/[^A-Za-z0-9]/, 'رمز خاص (!@#$...)'),
    confirmPassword: z.string(),
    howDidYouKnowUs: z.string().optional(),
    howDidYouKnowUsOther: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "كلمات المرور غير متطابقة",
    path: ["confirmPassword"],
});

// Full Schema for final submission (merges all steps)
export const signupSchema = z.object({
    ...step1Schema.shape,
    ...step2Schema.shape,
    ...step3Schema.shape
}).refine((data) => data.password === data.confirmPassword, {
    message: "كلمات المرور غير متطابقة",
    path: ["confirmPassword"],
});

export type SignupFormValues = z.infer<typeof signupSchema>;
