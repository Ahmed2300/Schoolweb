import apiClient, { setTokens, clearTokens } from './ApiClient';
import { endpoints } from './endpoints';

// Types
export interface AdminLoginRequest {
    email: string;
    password: string;
}

export interface AdminData {
    id: number;
    name: string;
    email: string;
    created_at?: string;
    updated_at?: string;
}

export interface AdminAuthResponse {
    token: string;
    data: AdminData;
}

// User types for admin management
export type UserRole = 'student' | 'parent' | 'teacher';
export type UserStatus = 'active' | 'inactive';

export interface UserData {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    created_at: string;
    updated_at?: string;
    image_path?: string;
    phone?: string;
    // Student-specific
    grade?: string;
    parent_id?: number;
    country_id?: number;
    city_id?: number;
    parent_phone?: string;
    how_do_you_know_us?: string;
    // Parent-specific
    relationship?: string;
    address?: string;
    occupation?: string;
    // Teacher-specific
    subject?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    links?: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
}

export interface UserListParams {
    page?: number;
    per_page?: number;
    search?: string;
    country_id?: number;
    city_id?: number;
}

// Update request types based on backend validation rules
export interface UpdateStudentRequest {
    name?: string;
    email?: string;
    password?: string;
    password_confirmation?: string;
    image_path?: string;
    phone?: string;
    parent_phone?: string;
    how_do_you_know_us?: string;
    grade?: string;
    status?: string;
    parent_id?: number;
    country_id?: number;
    city_id?: number;
}

export interface UpdateParentRequest {
    name: string;
    email: string;
    password?: string;
    image_path?: string;
    phone?: string;
    address?: string;
    relationship?: string;
    occupation?: string;
    status?: 'active' | 'inactive';
}

export interface UpdateTeacherRequest {
    name?: string;
    email?: string;
    phone?: string;
}

// Create teacher request based on backend StoreTeacherRequest
export interface CreateTeacherRequest {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    specialization: string;
    phone?: string;
    qualification?: string;
    balance?: number;
    status?: 'active' | 'inactive' | 'on-leave';
}

// Create admin request based on backend StoreAdminRequest
export interface CreateAdminRequest {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

// Admin Auth Service
export const adminService = {
    /**
     * Admin Login
     * Authenticates admin and stores token
     */
    login: async (data: AdminLoginRequest): Promise<AdminAuthResponse> => {
        const response = await apiClient.post(endpoints.adminAuth.login, data);

        // Store token on successful login
        if (response.data.token) {
            setTokens(response.data.token, '');
        }

        return response.data;
    },

    /**
     * Admin Logout
     * Clears stored tokens
     */
    logout: () => {
        clearTokens();
    },

    // ==================== STUDENTS ====================

    /**
     * Get paginated list of students
     */
    getStudents: async (params: UserListParams = {}): Promise<PaginatedResponse<UserData>> => {
        const response = await apiClient.get(endpoints.admin.students.list, { params });
        // Transform to unified UserData format
        const students = response.data.data.map((student: any) => ({
            ...student,
            role: 'student' as UserRole,
            status: student.status || 'active',
        }));
        return {
            data: students,
            meta: response.data.meta,
            links: response.data.links,
        };
    },

    /**
     * Get single student by ID
     */
    getStudent: async (id: number): Promise<UserData> => {
        const response = await apiClient.get(endpoints.admin.students.show(id));
        return { ...response.data.data, role: 'student' as UserRole };
    },

    /**
     * Delete student by ID
     */
    deleteStudent: async (id: number): Promise<void> => {
        await apiClient.delete(endpoints.admin.students.delete(id));
    },

    /**
     * Update student by ID
     */
    updateStudent: async (id: number, data: UpdateStudentRequest): Promise<UserData> => {
        const response = await apiClient.put(endpoints.admin.students.update(id), data);
        return { ...response.data.data, role: 'student' as UserRole };
    },

    // ==================== PARENTS ====================

    /**
     * Get paginated list of parents
     */
    getParents: async (params: UserListParams = {}): Promise<PaginatedResponse<UserData>> => {
        const response = await apiClient.get(endpoints.admin.parents.list, { params });
        // Transform to unified UserData format
        const parents = response.data.data.map((parent: any) => ({
            ...parent,
            role: 'parent' as UserRole,
            status: parent.status || 'active',
        }));
        return {
            data: parents,
            meta: response.data.meta,
            links: response.data.links,
        };
    },

    /**
     * Get single parent by ID
     */
    getParent: async (id: number): Promise<UserData> => {
        const response = await apiClient.get(endpoints.admin.parents.show(id));
        return { ...response.data.data, role: 'parent' as UserRole };
    },

    /**
     * Delete parent by ID
     */
    deleteParent: async (id: number): Promise<void> => {
        await apiClient.delete(endpoints.admin.parents.delete(id));
    },

    /**
     * Update parent by ID
     */
    updateParent: async (id: number, data: UpdateParentRequest): Promise<UserData> => {
        const response = await apiClient.put(endpoints.admin.parents.update(id), data);
        return { ...response.data.data, role: 'parent' as UserRole };
    },

    // ==================== TEACHERS ====================

    /**
     * Get paginated list of teachers
     */
    getTeachers: async (params: UserListParams = {}): Promise<PaginatedResponse<UserData>> => {
        const response = await apiClient.get(endpoints.admin.teachers.list, { params });
        // Transform to unified UserData format
        const teachers = response.data.data.map((teacher: any) => ({
            ...teacher,
            role: 'teacher' as UserRole,
            status: teacher.status || 'active',
        }));
        return {
            data: teachers,
            meta: response.data.meta,
            links: response.data.links,
        };
    },

    /**
     * Get single teacher by ID
     */
    getTeacher: async (id: number): Promise<UserData> => {
        const response = await apiClient.get(endpoints.admin.teachers.show(id));
        return { ...response.data.data, role: 'teacher' as UserRole };
    },

    /**
     * Delete teacher by ID
     */
    deleteTeacher: async (id: number): Promise<void> => {
        await apiClient.delete(endpoints.admin.teachers.delete(id));
    },

    /**
     * Update teacher by ID
     */
    updateTeacher: async (id: number, data: UpdateTeacherRequest): Promise<UserData> => {
        const response = await apiClient.put(endpoints.admin.teachers.update(id), data);
        return { ...response.data.data, role: 'teacher' as UserRole };
    },

    /**
     * Create a new teacher
     */
    createTeacher: async (data: CreateTeacherRequest): Promise<UserData> => {
        const response = await apiClient.post(endpoints.admin.teachers.create, data);
        return { ...response.data.data, role: 'teacher' as UserRole };
    },

    /**
     * Create a new admin (super admin only)
     */
    createAdmin: async (data: CreateAdminRequest): Promise<any> => {
        const response = await apiClient.post(endpoints.admin.admins.create, data);
        return response.data.data;
    },

    // ==================== ALL USERS ====================

    /**
     * Get all users (students + parents + teachers) combined
     * Fetches from all three endpoints and merges results
     * Uses Promise.allSettled to handle partial failures gracefully
     */
    getAllUsers: async (params: UserListParams = {}): Promise<{
        users: UserData[];
        stats: {
            totalStudents: number;
            totalParents: number;
            totalTeachers: number;
            total: number;
        };
    }> => {
        // Use allSettled to handle partial failures (e.g., if teachers endpoint fails)
        const results = await Promise.allSettled([
            adminService.getStudents(params),
            adminService.getParents(params),
            adminService.getTeachers(params),
        ]);

        // Extract successful results, use empty arrays for failures
        const studentsRes = results[0].status === 'fulfilled' ? results[0].value : { data: [], meta: { total: 0 } };
        const parentsRes = results[1].status === 'fulfilled' ? results[1].value : { data: [], meta: { total: 0 } };
        const teachersRes = results[2].status === 'fulfilled' ? results[2].value : { data: [], meta: { total: 0 } };

        // Log any failures for debugging
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                const endpoints = ['students', 'parents', 'teachers'];
                console.warn(`Failed to fetch ${endpoints[index]}:`, result.reason);
            }
        });

        const allUsers = [
            ...studentsRes.data,
            ...parentsRes.data,
            ...teachersRes.data,
        ];

        return {
            users: allUsers,
            stats: {
                totalStudents: studentsRes.meta.total,
                totalParents: parentsRes.meta.total,
                totalTeachers: teachersRes.meta.total,
                total: studentsRes.meta.total + parentsRes.meta.total + teachersRes.meta.total,
            },
        };
    },

    /**
     * Delete user by role and ID
     */
    deleteUser: async (role: UserRole, id: number): Promise<void> => {
        switch (role) {
            case 'student':
                await adminService.deleteStudent(id);
                break;
            case 'parent':
                await adminService.deleteParent(id);
                break;
            case 'teacher':
                await adminService.deleteTeacher(id);
                break;
        }
    },

    /**
     * Update user by role and ID
     * Routes to the correct update function based on role
     */
    updateUser: async (
        role: UserRole,
        id: number,
        data: UpdateStudentRequest | UpdateParentRequest | UpdateTeacherRequest
    ): Promise<UserData> => {
        switch (role) {
            case 'student':
                return await adminService.updateStudent(id, data as UpdateStudentRequest);
            case 'parent':
                return await adminService.updateParent(id, data as UpdateParentRequest);
            case 'teacher':
                return await adminService.updateTeacher(id, data as UpdateTeacherRequest);
            default:
                throw new Error(`Unknown role: ${role}`);
        }
    },

    // ==================== COURSES ====================

    /**
     * Get courses list
     */
    getCourses: async (params: UserListParams = {}): Promise<PaginatedResponse<any>> => {
        const response = await apiClient.get(endpoints.admin.courses.list, { params });
        return response.data;
    },

    // ==================== DASHBOARD ====================

    /**
     * Get dashboard statistics
     * Fetches counts from multiple endpoints
     */
    getDashboardStats: async (): Promise<{
        totalStudents: number;
        totalParents: number;
        totalTeachers: number;
        totalCourses: number;
    }> => {
        try {
            // Fetch all counts in parallel
            const [studentsRes, parentsRes, teachersRes, coursesRes] = await Promise.allSettled([
                apiClient.get(endpoints.admin.students.list, { params: { per_page: 1 } }),
                apiClient.get(endpoints.admin.parents.list, { params: { per_page: 1 } }),
                apiClient.get(endpoints.admin.teachers.list, { params: { per_page: 1 } }),
                apiClient.get(endpoints.admin.courses.list, { params: { per_page: 1 } }),
            ]);

            // Extract totals from meta, defaulting to 0 if request failed
            const getTotal = (result: PromiseSettledResult<any>): number => {
                if (result.status === 'fulfilled') {
                    return result.value.data?.meta?.total || result.value.data?.total || 0;
                }
                return 0;
            };

            return {
                totalStudents: getTotal(studentsRes),
                totalParents: getTotal(parentsRes),
                totalTeachers: getTotal(teachersRes),
                totalCourses: getTotal(coursesRes),
            };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            return {
                totalStudents: 0,
                totalParents: 0,
                totalTeachers: 0,
                totalCourses: 0,
            };
        }
    },
};

export default adminService;

