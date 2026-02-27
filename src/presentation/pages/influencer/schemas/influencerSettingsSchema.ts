import { z } from 'zod';

export const profileFormSchema = z.object({
    name: z.string().min(2, 'الاسم يجب أن يحتوي على حرفين على الأقل'),
    phone: z.string().optional().nullable(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const passwordFormSchema = z.object({
    newPassword: z.string().min(8, 'كلمة المرور يجب أن لا تقل عن 8 أحرف').optional().or(z.literal('')),
    confirmPassword: z.string().optional().or(z.literal('')),
}).refine((data) => {
    if (data.newPassword && data.newPassword !== data.confirmPassword) {
        return false;
    }
    return true;
}, {
    message: "كلمة المرور غير متطابقة",
    path: ["confirmPassword"]
});

export type PasswordFormValues = z.infer<typeof passwordFormSchema>;
