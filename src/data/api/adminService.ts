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
    type?: 'teacher' | 'instructor'; // Backend returns type based on is_academic
    is_academic?: boolean; // true = teacher (academic), false = instructor (skills)
    specialization?: string;
    qualification?: string;
    balance?: string;
    hire_date?: string;
    courses_count?: number;
    courses?: string[];
    subjects?: string[];
    grades?: string[];
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
    grade_id?: number;
    term_id?: number;
    semester_id?: number;
    is_academic?: boolean;
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

// Create student request based on backend StoreStudentRequest
export interface CreateStudentRequest {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
    parent_phone?: string;
    how_do_you_know_us?: string;
    grade_id?: number;
    country_id?: number;
    city_id?: number;
    status?: 'active' | 'inactive';
}

// Create parent request based on backend StoreParentRequest
export interface CreateParentRequest {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
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
    is_academic?: boolean;
    specialization?: string;
    qualification?: string;
    status?: 'active' | 'inactive' | 'on-leave';
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
    is_academic?: boolean; // true = teacher (academic), false = instructor (skills)
}

// Create admin request based on backend StoreAdminRequest
export interface CreateAdminRequest {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role_id?: number;  // Optional: Assign a role when creating admin
}

// ==================== NEW ENTITY TYPES ====================

// Role types
export interface RoleData {
    id: number;
    name: string;
    guard_name: string;
    permissions?: PermissionData[];
    created_at: string;
    updated_at: string;
}

export interface PermissionData {
    id: number;
    name: string;
    guard_name: string;
}

export interface CreateRoleRequest {
    name: string;
    permissions?: number[];
}

export interface UpdateRoleRequest {
    name?: string;
    permissions?: number[];
}

// Subject types


export interface CreateSubjectRequest {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    is_active?: boolean;
}

export interface UpdateSubjectRequest {
    name?: string;
    description?: string;
    icon?: string;
    color?: string;
    is_active?: boolean;
}

// Grade types
export interface GradeData {
    id: number;
    name: string;
    description?: string;
    order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateGradeRequest {
    name: string;
    description?: string;
    order?: number;
    is_active?: boolean;
}

export interface UpdateGradeRequest {
    name?: string;
    description?: string;
    order?: number;
    is_active?: boolean;
}

// Subscription types for admin management
export type AdminSubscriptionStatus = 0 | 1 | 2 | 3; // INACTIVE=0, ACTIVE=1, PENDING=2, REJECTED=3

export const AdminSubscriptionStatusLabels: Record<AdminSubscriptionStatus, string> = {
    0: 'غير نشط',
    1: 'نشط',
    2: 'قيد المراجعة',
    3: 'مرفوض',
};

export const AdminSubscriptionStatusColors: Record<AdminSubscriptionStatus, string> = {
    0: 'bg-slate-100 text-slate-700',
    1: 'bg-emerald-100 text-emerald-700',
    2: 'bg-amber-100 text-amber-700',
    3: 'bg-red-100 text-red-700',
};

export interface AdminSubscription {
    id: number;
    student_id: number;
    course_id: number;
    student?: {
        id: number;
        name: string;
        email: string;
        phone?: string;
        image_path?: string;
    };
    course?: {
        id: number;
        name: { ar?: string; en?: string } | string;
        code: string;
        price?: number;
    };
    status: AdminSubscriptionStatus;
    status_label: string;
    bill_image_path?: string;
    rejection_reason?: string;
    start_date?: string;
    end_date?: string;
    is_currently_active: boolean;
    created_at?: string;
    updated_at?: string;
}

// Course types (matching backend StoreCourseRequest)
export interface CourseData {
    id: number;
    name: { ar?: string; en?: string } | string;
    description?: { ar?: string; en?: string } | string;
    code: string;
    credits: number;
    duration_hours?: number;
    price?: number;
    old_price?: number;
    is_promoted?: boolean;
    is_active: boolean;
    is_academic?: boolean;
    start_date?: string;
    end_date?: string;
    image_path?: string;
    grade_id?: number;
    semester_id?: number;
    subject_id?: number;
    teacher_id?: number;
    grade?: { id: number; name: string };
    semester?: { id: number; name: string };
    subject?: { id: number; name: string };
    teacher?: { id: number; name: string };
    created_at?: string;
    updated_at?: string;
}

export interface CreateCourseRequest {
    name: { ar: string; en: string };
    description?: { ar?: string; en?: string };
    code: string;
    credits: number;
    duration_hours?: number;
    price?: number;
    old_price: number;
    is_promoted?: boolean;
    is_active?: boolean;
    is_academic?: boolean;
    start_date?: string;
    end_date?: string;
    image?: File;
    grade_id: number;
    semester_id: number;
    subject_id: number;
    teacher_id: number;
}

export interface UpdateCourseRequest {
    name?: { ar?: string; en?: string };
    description?: { ar?: string; en?: string };
    code?: string;
    credits?: number;
    duration_hours?: number;
    price?: number;
    old_price?: number;
    is_promoted?: boolean;
    is_active?: boolean;
    is_academic?: boolean;
    start_date?: string;
    end_date?: string;
    image?: File;
    grade_id?: number;
    semester_id?: number;
    subject_id?: number;
    teacher_id?: number;
}

// Lecture types
export interface LectureData {
    id: number;
    course_id: number;
    title: string;
    video_url?: string;
    duration?: number;
    order: number;
    is_free: boolean;
    attachments?: string[];
    created_at: string;
    updated_at: string;
}

export interface CreateLectureRequest {
    course_id: number;
    title: string;
    video_url?: string;
    duration?: number;
    order?: number;
    is_free?: boolean;
    attachments?: string[];
}

export interface UpdateLectureRequest {
    course_id?: number;
    title?: string;
    video_url?: string;
    duration?: number;
    order?: number;
    is_free?: boolean;
    attachments?: string[];
}

// Setting types
export interface SettingData {
    id: number;
    key: string;
    value: string;
    group?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateSettingRequest {
    key: string;
    value: string;
    group?: string;
}

export interface UpdateSettingRequest {
    key?: string;
    value?: string;
    group?: string;
}

// Report types
export interface RegistrationReportData {
    date: string;
    count: number;
    data?: Array<{
        id: number;
        name: string;
        email: string;
        created_at: string;
    }>;
}

export interface ReportParams {
    start_date?: string;
    end_date?: string;
    group_by?: 'day' | 'week' | 'month';
}

// Activity Log types
export interface ActivityLogData {
    id: number;
    log_name: string;
    description: string;
    subject_type?: string;
    subject_id?: number;
    causer_type?: string;
    causer_id?: number;
    properties?: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

// Semester types
export interface SemesterData {
    id: number;
    name: string | { ar?: string; en?: string };
    grade_id?: number;
    grade_ids?: number[];
    country_id?: number;
    start_date?: string;
    end_date?: string;
    created_at: string;
    updated_at?: string;
    grade?: { id: number; name: string };
    grades?: { id: number; name: string }[];
    country?: { id: number; name: string };
}

export interface CreateSemesterRequest {
    name: string | { ar?: string; en?: string };
    grade_id: number;  // Required by backend
    country_id: number;  // Required by backend
    start_date: string;  // Required by backend
    end_date: string;  // Required by backend
}

export interface UpdateSemesterRequest {
    name?: string | { ar?: string; en?: string };
    grade_id?: number;
    country_id?: number;
    start_date?: string;
    end_date?: string;
}

// Subject types
export interface SubjectData {
    id: number;
    name: string;
    code: string;
    description?: string;
    study_term_id?: number;
    grade_id?: number;
    semester_ids?: number[];
    created_at: string;
    updated_at?: string;
    studyTerm?: { id: number; name: string };
    grade?: { id: number; name: string };
    semesters?: { id: number; name: string }[];
}

export interface CreateSubjectRequest {
    name: string;
    code: string;
    description?: string;
    study_term_id?: number;
    grade_id?: number;
    semester_ids?: number[];
}

export interface UpdateSubjectRequest {
    name?: string;
    code?: string;
    description?: string;
    study_term_id?: number;
    grade_id?: number;
    semester_ids?: number[];
}

// Payment types
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'refunded';
export type PaymentMethod = 'bank_transfer' | 'cash' | 'wallet' | 'card';

export interface PaymentData {
    id: number;
    subscription_id?: number;
    student_id: number;
    amount: number;
    currency: string;
    method: PaymentMethod;
    status: PaymentStatus;
    receipt_image?: string;
    notes?: string;
    approved_by?: number;
    approved_at?: string;
    rejected_by?: number;
    rejected_at?: string;
    rejection_reason?: string;
    student?: { id: number; name: string; email: string };
    subscription?: { id: number; course_id: number; course?: { id: number; name: string } };
    approver?: { id: number; name: string };
    created_at: string;
    updated_at: string;
}

export interface CreatePaymentRequest {
    subscription_id?: number;
    student_id: number;
    amount: number;
    currency?: string;
    method: PaymentMethod;
    notes?: string;
    receipt_image?: File;
}

export interface UpdatePaymentRequest {
    amount?: number;
    method?: PaymentMethod;
    notes?: string;
    receipt_image?: File;
}

export interface PaymentListParams {
    page?: number;
    per_page?: number;
    search?: string;
    status?: PaymentStatus;
    method?: PaymentMethod;
    student_id?: number;
}

export interface PaymentStatistics {
    total_payments: number;
    total_amount: number;
    pending_count: number;
    approved_count: number;
    rejected_count: number;
    pending_amount: number;
    approved_amount: number;
    rejected_amount: number;
}

// Video Upload types
export interface VideoUploadInitiateRequest {
    filename: string;
    filesize: number;
    mimetype: string;
}

export interface VideoUploadInitiateResponse {
    upload_id: string;
    chunk_size: number;
    total_chunks: number;
}

export interface VideoUploadChunkRequest {
    upload_id: string;
    chunk_index: number;
    chunk_data: Blob;
}

export interface VideoUploadCompleteRequest {
    upload_id: string;
}

export interface VideoUploadCompleteResponse {
    video_url: string;
    duration?: number;
}

export interface VideoUploadProgressResponse {
    upload_id: string;
    uploaded_chunks: number;
    total_chunks: number;
    percent: number;
}

// Student-Parent Assignment types
export interface AssignParentRequest {
    student_id: number;
    parent_id: number;
    is_primary?: boolean;
}

export interface UpdateParentAssignmentRequest {
    parent_id: number;
    is_primary?: boolean;
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

    /**
     * Create a new student (admin only)
     */
    createStudent: async (data: CreateStudentRequest): Promise<UserData> => {
        const response = await apiClient.post(endpoints.admin.students.create, data);
        return { ...response.data.data, role: 'student' as UserRole };
    },

    /**
     * Create a new parent (admin only)
     */
    createParent: async (data: CreateParentRequest): Promise<UserData> => {
        const response = await apiClient.post(endpoints.admin.parents.create, data);
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
     * Create a new teacher with image (uses FormData)
     */
    createTeacherWithImage: async (formData: FormData): Promise<UserData> => {
        const response = await apiClient.post(endpoints.admin.teachers.create, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return { ...response.data.data, role: 'teacher' as UserRole };
    },

    /**
     * Create a new admin (super admin only)
     */
    createAdmin: async (data: CreateAdminRequest): Promise<any> => {
        const response = await apiClient.post(endpoints.admin.admins.create, data);
        return response.data.data;
    },

    /**
     * Get paginated list of admins
     */
    getAdmins: async (params: UserListParams = {}): Promise<PaginatedResponse<any>> => {
        const response = await apiClient.get(endpoints.admin.admins.list, { params });
        return {
            data: response.data.data || [],
            meta: response.data.meta,
            links: response.data.links,
        };
    },

    /**
     * Get single admin by ID
     */
    getAdmin: async (id: number): Promise<any> => {
        const response = await apiClient.get(endpoints.admin.admins.show(id));
        return response.data.data;
    },

    /**
     * Update admin by ID
     */
    updateAdmin: async (id: number, data: Partial<CreateAdminRequest>): Promise<any> => {
        const response = await apiClient.put(endpoints.admin.admins.update(id), data);
        return response.data.data;
    },

    /**
     * Delete admin by ID
     */
    deleteAdmin: async (id: number): Promise<void> => {
        await apiClient.delete(endpoints.admin.admins.delete(id));
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
     * Get courses list with pagination
     */
    getCourses: async (params: UserListParams = {}): Promise<PaginatedResponse<CourseData>> => {
        const response = await apiClient.get(endpoints.admin.courses.list, { params });
        return response.data;
    },

    /**
     * Get single course by ID
     */
    getCourse: async (id: number): Promise<CourseData> => {
        const response = await apiClient.get(endpoints.admin.courses.show(id));
        return response.data.data;
    },

    /**
     * Create a new course
     */
    createCourse: async (data: CreateCourseRequest): Promise<CourseData> => {
        const response = await apiClient.post(endpoints.admin.courses.create, data);
        return response.data.data;
    },

    /**
     * Create a new course with image upload (uses FormData)
     */
    createCourseWithImage: async (formData: FormData): Promise<CourseData> => {
        const response = await apiClient.post(endpoints.admin.courses.create, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data;
    },

    /**
     * Update a course
     */
    updateCourse: async (id: number, data: UpdateCourseRequest): Promise<CourseData> => {
        const response = await apiClient.put(endpoints.admin.courses.update(id), data);
        return response.data.data;
    },

    /**
     * Update a course with image upload (uses FormData)
     */
    updateCourseWithImage: async (id: number, formData: FormData): Promise<CourseData> => {
        // For PUT with FormData, we need to use POST with _method override
        formData.append('_method', 'PUT');
        const response = await apiClient.post(endpoints.admin.courses.update(id), formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data;
    },

    /**
     * Delete a course (soft delete)
     */
    deleteCourse: async (id: number): Promise<void> => {
        await apiClient.delete(endpoints.admin.courses.delete(id));
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

    // ==================== ACTIVITY LOGS ====================

    /**
     * Get activity logs with pagination
     */
    getActivityLogs: async (params: { per_page?: number; page?: number } = {}): Promise<PaginatedResponse<ActivityLogData>> => {
        const response = await apiClient.get(endpoints.admin.activityLogs.list, { params });
        return response.data;
    },

    // ==================== PAYMENTS ====================

    /**
     * Get payments list with pagination and filters
     */
    getPayments: async (params: PaymentListParams = {}): Promise<PaginatedResponse<PaymentData>> => {
        const response = await apiClient.get(endpoints.admin.payments.list, { params });
        return response.data;
    },

    /**
     * Get single payment by ID
     */
    getPayment: async (id: number): Promise<PaymentData> => {
        const response = await apiClient.get(endpoints.admin.payments.show(id));
        return response.data.data;
    },

    /**
     * Create a new payment
     */
    createPayment: async (data: CreatePaymentRequest): Promise<PaymentData> => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (value instanceof File) {
                    formData.append(key, value);
                } else {
                    formData.append(key, String(value));
                }
            }
        });
        const response = await apiClient.post(endpoints.admin.payments.create, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.data;
    },

    /**
     * Update a payment
     */
    updatePayment: async (id: number, data: UpdatePaymentRequest): Promise<PaymentData> => {
        const response = await apiClient.put(endpoints.admin.payments.update(id), data);
        return response.data.data;
    },

    /**
     * Delete a payment
     */
    deletePayment: async (id: number): Promise<void> => {
        await apiClient.delete(endpoints.admin.payments.delete(id));
    },

    /**
     * Approve a payment
     */
    approvePayment: async (id: number): Promise<PaymentData> => {
        const response = await apiClient.post(endpoints.admin.payments.approve(id));
        return response.data.data;
    },

    /**
     * Reject a payment with reason
     */
    rejectPayment: async (id: number, reason: string): Promise<PaymentData> => {
        const response = await apiClient.post(endpoints.admin.payments.reject(id), { rejection_reason: reason });
        return response.data.data;
    },

    /**
     * Get payment statistics
     */
    getPaymentStatistics: async (): Promise<{ pending: number; approved: number; rejected: number; total_amount: number }> => {
        const response = await apiClient.get(endpoints.admin.payments.statistics);
        return response.data.data;
    },

    // ==================== ROLES ====================

    getRoles: async (params: UserListParams = {}): Promise<PaginatedResponse<RoleData>> => {
        const response = await apiClient.get(endpoints.admin.roles.list, { params });
        return response.data;
    },

    getRole: async (id: number): Promise<RoleData> => {
        const response = await apiClient.get(endpoints.admin.roles.show(id));
        return response.data.data;
    },

    createRole: async (data: CreateRoleRequest): Promise<RoleData> => {
        const response = await apiClient.post(endpoints.admin.roles.create, data);
        return response.data.data;
    },

    updateRole: async (id: number, data: UpdateRoleRequest): Promise<RoleData> => {
        const response = await apiClient.put(endpoints.admin.roles.update(id), data);
        return response.data.data;
    },

    deleteRole: async (id: number): Promise<void> => {
        await apiClient.delete(endpoints.admin.roles.delete(id));
    },

    // ==================== SUBJECTS ====================

    getSubjects: async (params: UserListParams = {}): Promise<PaginatedResponse<SubjectData>> => {
        const response = await apiClient.get(endpoints.admin.subjects.list, { params });
        return response.data;
    },

    getSubject: async (id: number): Promise<SubjectData> => {
        const response = await apiClient.get(endpoints.admin.subjects.show(id));
        return response.data.data;
    },

    createSubject: async (data: CreateSubjectRequest): Promise<SubjectData> => {
        const response = await apiClient.post(endpoints.admin.subjects.create, data);
        return response.data.data;
    },

    updateSubject: async (id: number, data: UpdateSubjectRequest): Promise<SubjectData> => {
        const response = await apiClient.put(endpoints.admin.subjects.update(id), data);
        return response.data.data;
    },

    deleteSubject: async (id: number): Promise<void> => {
        await apiClient.delete(endpoints.admin.subjects.delete(id));
    },

    // ==================== GRADES ====================

    getGrades: async (params: UserListParams = {}): Promise<PaginatedResponse<GradeData>> => {
        const response = await apiClient.get(endpoints.admin.grades.list, { params });
        return response.data;
    },

    getGrade: async (id: number): Promise<GradeData> => {
        const response = await apiClient.get(endpoints.admin.grades.show(id));
        return response.data.data;
    },

    createGrade: async (data: CreateGradeRequest): Promise<GradeData> => {
        const response = await apiClient.post(endpoints.admin.grades.create, data);
        return response.data.data;
    },

    updateGrade: async (id: number, data: UpdateGradeRequest): Promise<GradeData> => {
        const response = await apiClient.put(endpoints.admin.grades.update(id), data);
        return response.data.data;
    },

    deleteGrade: async (id: number): Promise<void> => {
        await apiClient.delete(endpoints.admin.grades.delete(id));
    },

    // ==================== SEMESTERS ====================

    getSemesters: async (params: UserListParams = {}): Promise<PaginatedResponse<SemesterData>> => {
        const response = await apiClient.get(endpoints.admin.semesters.list, { params });
        return response.data;
    },

    getSemester: async (id: number): Promise<SemesterData> => {
        const response = await apiClient.get(endpoints.admin.semesters.show(id));
        return response.data.data;
    },

    createSemester: async (data: CreateSemesterRequest): Promise<SemesterData> => {
        const response = await apiClient.post(endpoints.admin.semesters.create, data);
        return response.data.data;
    },

    updateSemester: async (id: number, data: UpdateSemesterRequest): Promise<SemesterData> => {
        const response = await apiClient.put(endpoints.admin.semesters.update(id), data);
        return response.data.data;
    },

    deleteSemester: async (id: number): Promise<void> => {
        await apiClient.delete(endpoints.admin.semesters.delete(id));
    },

    // ==================== LECTURES ====================

    getLectures: async (params: UserListParams = {}): Promise<PaginatedResponse<LectureData>> => {
        const response = await apiClient.get(endpoints.admin.lectures.list, { params });
        return response.data;
    },

    getLecture: async (id: number): Promise<LectureData> => {
        const response = await apiClient.get(endpoints.admin.lectures.show(id));
        return response.data.data;
    },

    createLecture: async (data: CreateLectureRequest): Promise<LectureData> => {
        const response = await apiClient.post(endpoints.admin.lectures.create, data);
        return response.data.data;
    },

    updateLecture: async (id: number, data: UpdateLectureRequest): Promise<LectureData> => {
        const response = await apiClient.put(endpoints.admin.lectures.update(id), data);
        return response.data.data;
    },

    deleteLecture: async (id: number): Promise<void> => {
        await apiClient.delete(endpoints.admin.lectures.delete(id));
    },

    createLectureWithChunkedVideo: async (data: CreateLectureRequest): Promise<LectureData> => {
        const response = await apiClient.post(endpoints.admin.lectures.chunkedCreate, data);
        return response.data.data;
    },

    updateLectureWithChunkedVideo: async (id: number, data: UpdateLectureRequest): Promise<LectureData> => {
        const response = await apiClient.post(endpoints.admin.lectures.chunkedUpdate(id), data);
        return response.data.data;
    },

    // ==================== COUNTRIES ====================

    getCountries: async (params: UserListParams = {}): Promise<PaginatedResponse<{ id: number; name: string; code: string }>> => {
        const response = await apiClient.get(endpoints.admin.countries.list, { params });
        return response.data;
    },

    createCountry: async (data: { name: string; code: string }): Promise<{ id: number; name: string; code: string }> => {
        const response = await apiClient.post(endpoints.admin.countries.create, data);
        return response.data.data;
    },

    updateCountry: async (id: number, data: { name?: string; code?: string }): Promise<{ id: number; name: string; code: string }> => {
        const response = await apiClient.put(endpoints.admin.countries.update(id), data);
        return response.data.data;
    },

    deleteCountry: async (id: number): Promise<void> => {
        await apiClient.delete(endpoints.admin.countries.delete(id));
    },

    // ==================== CITIES ====================

    getCities: async (params: UserListParams = {}): Promise<PaginatedResponse<{ id: number; country_id: number; name: string }>> => {
        const response = await apiClient.get(endpoints.admin.cities.list, { params });
        return response.data;
    },

    createCity: async (data: { country_id: number; name: string }): Promise<{ id: number; country_id: number; name: string }> => {
        const response = await apiClient.post(endpoints.admin.cities.create, data);
        return response.data.data;
    },

    updateCity: async (id: number, data: { country_id?: number; name?: string }): Promise<{ id: number; country_id: number; name: string }> => {
        const response = await apiClient.put(endpoints.admin.cities.update(id), data);
        return response.data.data;
    },

    deleteCity: async (id: number): Promise<void> => {
        await apiClient.delete(endpoints.admin.cities.delete(id));
    },

    // ==================== SETTINGS ====================

    getSettings: async (params: UserListParams = {}): Promise<PaginatedResponse<SettingData>> => {
        const response = await apiClient.get(endpoints.admin.settings.list, { params });
        return response.data;
    },

    getSetting: async (id: number): Promise<SettingData> => {
        const response = await apiClient.get(endpoints.admin.settings.show(id));
        return response.data.data;
    },

    createSetting: async (data: CreateSettingRequest): Promise<SettingData> => {
        const response = await apiClient.post(endpoints.admin.settings.create, data);
        return response.data.data;
    },

    updateSetting: async (id: number, data: UpdateSettingRequest): Promise<SettingData> => {
        const response = await apiClient.put(endpoints.admin.settings.update(id), data);
        return response.data.data;
    },

    deleteSetting: async (id: number): Promise<void> => {
        await apiClient.delete(endpoints.admin.settings.delete(id));
    },

    uploadLogo: async (file: File): Promise<{ url: string }> => {
        const formData = new FormData();
        formData.append('logo', file);
        const response = await apiClient.post(endpoints.admin.settings.uploadLogo, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    // ==================== REPORTS ====================

    getStudentRegistrations: async (params: ReportParams = {}): Promise<RegistrationReportData[]> => {
        const response = await apiClient.get(endpoints.admin.reports.studentRegistrations, { params });
        return response.data.data;
    },

    getTeacherRegistrations: async (params: ReportParams = {}): Promise<RegistrationReportData[]> => {
        const response = await apiClient.get(endpoints.admin.reports.teacherRegistrations, { params });
        return response.data.data;
    },

    getParentRegistrations: async (params: ReportParams = {}): Promise<RegistrationReportData[]> => {
        const response = await apiClient.get(endpoints.admin.reports.parentRegistrations, { params });
        return response.data.data;
    },


    // ==================== VIDEO UPLOAD ====================

    initiateVideoUpload: async (data: VideoUploadInitiateRequest): Promise<VideoUploadInitiateResponse> => {
        const response = await apiClient.post(endpoints.admin.videos.initiate, data);
        return response.data;
    },

    uploadVideoChunk: async (data: VideoUploadChunkRequest): Promise<{ success: boolean }> => {
        const formData = new FormData();
        formData.append('upload_id', data.upload_id);
        formData.append('chunk_index', String(data.chunk_index));
        formData.append('chunk_data', data.chunk_data);
        const response = await apiClient.post(endpoints.admin.videos.chunk, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    completeVideoUpload: async (data: VideoUploadCompleteRequest): Promise<VideoUploadCompleteResponse> => {
        const response = await apiClient.post(endpoints.admin.videos.complete, data);
        return response.data;
    },

    getVideoUploadProgress: async (uploadId: string): Promise<VideoUploadProgressResponse> => {
        const response = await apiClient.get(endpoints.admin.videos.progress, { params: { upload_id: uploadId } });
        return response.data;
    },

    cancelVideoUpload: async (uploadId: string): Promise<void> => {
        await apiClient.post(endpoints.admin.videos.cancel, { upload_id: uploadId });
    },

    // ==================== STUDENT-PARENT ASSIGNMENT ====================

    assignParentToStudent: async (data: AssignParentRequest): Promise<{ success: boolean }> => {
        const response = await apiClient.post(endpoints.admin.studentParent.assign, data);
        return response.data;
    },

    updateStudentParentAssignment: async (studentId: number, data: UpdateParentAssignmentRequest): Promise<{ success: boolean }> => {
        const response = await apiClient.put(endpoints.admin.studentParent.update(studentId), data);
        return response.data;
    },

    removeParentFromStudent: async (studentId: number): Promise<void> => {
        await apiClient.delete(endpoints.admin.studentParent.remove(studentId));
    },

    // ==================== SUBSCRIPTION MANAGEMENT ====================

    getSubscriptions: async (params?: { status?: number; per_page?: number; page?: number }): Promise<PaginatedResponse<AdminSubscription>> => {
        const response = await apiClient.get('/api/v1/admin/subscriptions', { params });
        return response.data;
    },

    getSubscription: async (id: number): Promise<AdminSubscription> => {
        const response = await apiClient.get(`/api/v1/admin/subscriptions/${id}`);
        return response.data.data || response.data;
    },

    approveSubscription: async (id: number): Promise<AdminSubscription> => {
        const response = await apiClient.post(`/api/v1/admin/subscriptions/${id}/activate`);
        return response.data.data || response.data;
    },

    rejectSubscription: async (id: number, rejectionReason: string): Promise<AdminSubscription> => {
        const response = await apiClient.post(`/api/v1/admin/subscriptions/${id}/reject`, {
            rejection_reason: rejectionReason,
        });
        return response.data.data || response.data;
    },

    deactivateSubscription: async (id: number): Promise<AdminSubscription> => {
        const response = await apiClient.post(`/api/v1/admin/subscriptions/${id}/deactivate`);
        return response.data.data || response.data;
    },


};

export default adminService;

