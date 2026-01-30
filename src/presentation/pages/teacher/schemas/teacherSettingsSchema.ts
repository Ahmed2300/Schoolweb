import { z } from 'zod';

export const profileFormSchema = z.object({
    name: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
    email: z.string().email(),
    phone: z.string().regex(/^\+?[0-9]{7,15}$/, 'رقم الهاتف غير صحيح').optional().or(z.literal('')),
    specialization: z.string().optional(),
    qualification: z.string().optional(),
    // We don't validate image here as it's handled separately or as a File object which Zod handles differently in browser
});

export const passwordFormSchema = z.object({
    currentPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
    newPassword: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
    confirmPassword: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "كلمات المرور غير متطابقة",
    path: ["confirmPassword"],
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
export type PasswordFormValues = z.infer<typeof passwordFormSchema>;
