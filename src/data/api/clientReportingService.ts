
import ApiClient from './ApiClient';
import { endpoints } from './endpoints';

export interface ClientReporting {
    id: number;
    text_content: string;
    image_path: string | null;
    reportable_id: number | null;
    reportable_type: string | null;
    guest_name: string | null;
    guest_email: string | null;
    created_at: string;
    updated_at: string;
    submitter_name: string; // Helper from backend resource
    submitter_email: string; // Helper from backend resource
    submitter_image: string | null; // Helper
    submitter_role: 'student' | 'teacher' | 'parent' | 'guest'; // Helper
    images?: string[]; // Array of image URLs
}

export interface ClientReportingResponse {
    data: ClientReporting[];
    links?: any;
    meta?: any;
}

export type UserRole = 'student' | 'teacher' | 'parent' | 'guest';

class ClientReportingService {
    /**
     * Submit a new bug/issue report
     * @param formData FormData containing text_content, image (optional), guest_name/email (optional)
     */
    async submitReport(formData: FormData): Promise<void> {
        await ApiClient.post(endpoints.clientReportings.store, formData);
    }

    /**
     * Get list of reports (Admin only)
     * @param role Optional role filter
     */
    async getReports(role?: UserRole): Promise<ClientReportingResponse> {
        const params: any = {};
        if (role) {
            params.role = role;
        }

        // Ensure the endpoint exists in endpoints.ts, usually it's the same base URL for GET
        const response = await ApiClient.get<ClientReportingResponse>(endpoints.clientReportings.list, { params });
        return response.data;
    }
}

export const clientReportingService = new ClientReportingService();
