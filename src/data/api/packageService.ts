import apiClient from './ApiClient';
import { endpoints } from './endpoints';
import type { Course } from './studentService';

// Re-export Course for consumers of this module
export type { Course };

// ==================== Types ====================

export interface Package {
    id: number;
    name: string;
    description?: string;
    price: number;
    final_price?: number; // Price after discount
    grade_id: number;
    type: 'term' | 'semester' | 'grade' | 'custom';
    is_active: boolean;
    // Image
    image?: string;
    // Discount fields
    is_discount_active?: boolean;
    is_discount_valid?: boolean; // Computed field from backend
    discount_percentage?: number;
    discount_price?: number;
    discount_amount?: number; // Computed: price - final_price
    savings?: number; // Computed: courses_total_value - final_price
    courses_total_value?: number; // Sum of individual course prices
    // Relations
    courses_count?: number;
    courses?: Course[];
    grade?: {
        id: number;
        name: string;
    };
    created_at?: string;
    updated_at?: string;
}

export interface PackageSubscription {
    id: number;
    student_id: number;
    package_id: number;
    status: 'pending' | 'active' | 'rejected' | 'expired';
    bill_image_url?: string;
    promo_code?: string;
    commission_amount?: number;
    rejection_reason?: string;
    start_date?: string;
    end_date?: string;
    approved_by?: number;
    created_at: string;
    updated_at: string;
    package?: Package;
    student?: {
        id: number;
        name: string;
        email: string;
        phone?: string;
        avatar?: string;
    };
}

export interface PurchaseCheckResult {
    can_purchase: boolean;
    conflicts: Array<{
        course_id: number;
        course_name: string;
        status: string;
    }>;
    total_courses: number;
    new_courses: number;
}

// ==================== Service ====================

export const packageService = {
    // ==================== Student Functions ====================

    /**
     * Get all available packages
     */
    getPackages: async (filters?: { grade_id?: number; type?: string }): Promise<Package[]> => {
        const params = new URLSearchParams();
        if (filters?.grade_id) params.append('grade_id', String(filters.grade_id));
        if (filters?.type) params.append('type', filters.type);

        const url = params.toString()
            ? `${endpoints.packages.list}?${params.toString()}`
            : endpoints.packages.list;

        const response = await apiClient.get(url);
        return response.data.data || response.data;
    },

    /**
     * Get package details
     */
    getPackageDetails: async (id: number): Promise<Package> => {
        const response = await apiClient.get(endpoints.packages.detail(id));
        return response.data.data || response.data;
    },

    /**
     * Check if student can purchase a package
     */
    checkPurchase: async (packageId: number): Promise<PurchaseCheckResult> => {
        const response = await apiClient.get(endpoints.packages.checkPurchase(packageId));
        return response.data;
    },

    /**
     * Purchase a package (with optional bill image)
     */
    purchasePackage: async (packageId: number, billImage?: File, promoCode?: string): Promise<PackageSubscription> => {
        const formData = new FormData();
        if (billImage) {
            formData.append('bill_image', billImage);
        }
        if (promoCode) {
            formData.append('promo_code', promoCode);
        }

        // Don't set Content-Type manually - let axios handle it for FormData
        const response = await apiClient.post(endpoints.packages.purchase(packageId), formData);

        return response.data.subscription;
    },

    /**
     * Get student's package subscriptions
     */
    getMyPackageSubscriptions: async (status?: string): Promise<PackageSubscription[]> => {
        const url = status
            ? `${endpoints.packages.mySubscriptions}?status=${status}`
            : endpoints.packages.mySubscriptions;

        const response = await apiClient.get(url);
        return response.data.subscriptions || response.data;
    },

    // ==================== Admin Functions ====================

    /**
     * Get all package subscriptions (admin) with optional status filter
     */
    getAllSubscriptions: async (page = 1, perPage = 15, status?: string): Promise<{
        data: PackageSubscription[];
        meta: { current_page: number; last_page: number; per_page: number; total: number };
    }> => {
        let url = `${endpoints.packages.subscriptions}?page=${page}&per_page=${perPage}`;
        if (status) {
            url += `&status=${status}`;
        }
        const response = await apiClient.get(url);
        return response.data;
    },

    /**
     * Approve a package subscription (admin)
     */
    approveSubscription: async (subscriptionId: number, options?: {
        start_date?: string;
        end_date?: string;
    }): Promise<PackageSubscription> => {
        const response = await apiClient.post(
            endpoints.packages.approveSubscription(subscriptionId),
            options || {}
        );
        return response.data.subscription;
    },

    /**
     * Reject a package subscription (admin)
     */
    rejectSubscription: async (subscriptionId: number, reason?: string): Promise<PackageSubscription> => {
        const response = await apiClient.post(
            endpoints.packages.rejectSubscription(subscriptionId),
            { reason }
        );
        return response.data.subscription;
    },

    // ==================== Admin CRUD ====================

    /**
     * Create a new package (admin)
     */
    createPackage: async (data: Partial<Package> & { course_ids?: number[] }): Promise<Package> => {
        const response = await apiClient.post(endpoints.packages.create, data);
        return response.data.data || response.data;
    },

    /**
     * Update a package (admin)
     */
    updatePackage: async (id: number, data: Partial<Package>): Promise<Package> => {
        const response = await apiClient.put(endpoints.packages.update(id), data);
        return response.data.data || response.data;
    },

    /**
     * Delete a package (admin)
     */
    deletePackage: async (id: number): Promise<void> => {
        await apiClient.delete(endpoints.packages.delete(id));
    },

    /**
     * Attach courses to a package (admin)
     */
    attachCourses: async (packageId: number, courseIds: number[]): Promise<Package> => {
        const response = await apiClient.post(endpoints.packages.attachCourses(packageId), {
            course_ids: courseIds,
        });
        return response.data.data || response.data;
    },

    /**
     * Detach courses from a package (admin)
     */
    detachCourses: async (packageId: number, courseIds: number[]): Promise<Package> => {
        const response = await apiClient.post(endpoints.packages.detachCourses(packageId), {
            course_ids: courseIds,
        });
        return response.data.data || response.data;
    },
};
