// API endpoints configuration matching backend routes
export const endpoints = {
    // Student Auth
    studentAuth: {
        // Public routes
        register: '/api/v1/auth/students/register',
        login: '/api/v1/auth/students/login',
        verifyEmail: '/api/v1/auth/students/verify-email',
        resendOtp: '/api/v1/auth/students/resend-otp',
        forgotPassword: '/api/v1/auth/students/forgot-password',
        resetPassword: '/api/v1/auth/students/reset-password',
        // Protected routes
        me: '/api/v1/students/auth/me',
        updateProfile: '/api/v1/students/auth/me',
        refresh: '/api/v1/students/auth/refresh',
        changePassword: '/api/v1/students/auth/change-password',
        logout: '/api/v1/students/auth/logout',
        logoutAll: '/api/v1/students/auth/logout-all',
    },

    // Parent Auth
    parentAuth: {
        register: '/api/v1/auth/parents/register',
        login: '/api/v1/auth/parents/login',
        verifyEmail: '/api/v1/auth/parents/verify-email',
        resendOtp: '/api/v1/auth/parents/resend-otp',
        me: '/api/v1/auth/parents/me',
        updateProfile: '/api/v1/auth/parents/me',
        refresh: '/api/v1/auth/parents/refresh',
        changePassword: '/api/v1/auth/parents/change-password',
        forgotPassword: '/api/v1/auth/parents/forgot-password',
        resetPassword: '/api/v1/auth/parents/reset-password',
        logout: '/api/v1/auth/parents/logout',
        logoutAll: '/api/v1/auth/parents/logout-all',
    },

    // Admin Auth
    adminAuth: {
        login: '/api/v1/admin/auth/login',
    },

    // Admin - User Management
    admin: {
        // Students
        students: {
            list: '/api/v1/admin/students',
            create: '/api/v1/admin/students',
            show: (id: number) => `/api/v1/admin/students/${id}`,
            update: (id: number) => `/api/v1/admin/students/${id}`,
            delete: (id: number) => `/api/v1/admin/students/${id}`,
        },
        // Parents
        parents: {
            list: '/api/v1/admin/parents',
            create: '/api/v1/admin/parents',
            show: (id: number) => `/api/v1/admin/parents/${id}`,
            update: (id: number) => `/api/v1/admin/parents/${id}`,
            delete: (id: number) => `/api/v1/admin/parents/${id}`,
        },
        // Teachers
        teachers: {
            list: '/api/v1/admin/teachers',
            create: '/api/v1/admin/teachers',
            show: (id: number) => `/api/v1/admin/teachers/${id}`,
            update: (id: number) => `/api/v1/admin/teachers/${id}`,
            delete: (id: number) => `/api/v1/admin/teachers/${id}`,
        },
        // Admins
        admins: {
            list: '/api/v1/admin/admins',
            create: '/api/v1/admin/admins',
            show: (id: number) => `/api/v1/admin/admins/${id}`,
            update: (id: number) => `/api/v1/admin/admins/${id}/update`,
            delete: (id: number) => `/api/v1/admin/admins/delete/${id}`,
        },
        // Courses
        courses: {
            list: '/api/v1/admin/courses',
        },
        // Grades
        grades: {
            list: '/api/v1/admin/grades',
        },
    },

    // Grades (authenticated)
    grades: {
        list: '/api/v1/grades',
        detail: (id: number) => `/api/v1/grades/${id}`,
    },

    // Semesters (authenticated)
    semesters: {
        list: '/api/v1/semesters',
        detail: (id: number) => `/api/v1/semesters/${id}`,
    },

    // Lectures
    lectures: {
        list: '/api/v1/lectures',
        detail: (id: string) => `/api/v1/lectures/${id}`,
    },

    // Countries & Cities (for registration)
    locations: {
        countries: '/api/v1/countries',
        cities: (countryId: number) => `/api/v1/countries/${countryId}/cities`,
    },

    // Courses
    courses: {
        list: '/api/v1/courses',
        detail: (id: string) => `/api/v1/courses/${id}`,
        enrolled: '/api/v1/courses/enrolled',
        featured: '/api/v1/courses/featured',
        recommended: '/api/v1/courses/recommended',
        search: '/api/v1/courses/search',
        create: '/api/v1/courses',
        update: (id: string) => `/api/v1/courses/${id}`,
        delete: (id: string) => `/api/v1/courses/${id}`,
        publish: (id: string) => `/api/v1/courses/${id}/publish`,
    },

    // Subscriptions
    subscriptions: {
        list: '/api/v1/subscriptions',
        detail: (id: string) => `/api/v1/subscriptions/${id}`,
        checkAccess: '/api/v1/subscriptions/check-access',
        request: '/api/v1/subscriptions/request',
        cancel: (id: string) => `/api/v1/subscriptions/${id}/cancel`,
        pending: '/api/v1/subscriptions/pending',
        approve: (id: string) => `/api/v1/subscriptions/${id}/approve`,
        reject: (id: string) => `/api/v1/subscriptions/${id}/reject`,
    },
} as const;
