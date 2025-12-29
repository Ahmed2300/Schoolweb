// API endpoints configuration matching backend routes
export const endpoints = {
    // Student Auth
    studentAuth: {
        register: '/api/v1/students/auth/register',
        login: '/api/v1/students/auth/login',
        verifyEmail: '/api/v1/students/auth/verify-email',
        resendOtp: '/api/v1/students/auth/resend-otp',
        me: '/api/v1/students/auth/me',
        refresh: '/api/v1/students/auth/refresh',
        changePassword: '/api/v1/students/auth/change-password',
        forgotPassword: '/api/v1/students/auth/forgot-password',
        resetPassword: '/api/v1/students/auth/reset-password',
        logout: '/api/v1/students/auth/logout',
        logoutAll: '/api/v1/students/auth/logout-all',
    },

    // Parent Auth
    parentAuth: {
        register: '/v1/api/auth/parents/register',
        login: '/v1/api/auth/parents/login',
        verifyEmail: '/v1/api/auth/parents/verify-email',
        resendOtp: '/v1/api/auth/parents/resend-otp',
        me: '/v1/api/auth/parents/me',
        refresh: '/v1/api/auth/parents/refresh',
        changePassword: '/v1/api/auth/parents/change-password',
        forgotPassword: '/v1/api/auth/parents/forgot-password',
        resetPassword: '/v1/api/auth/parents/reset-password',
        logout: '/v1/api/auth/parents/logout',
        logoutAll: '/v1/api/auth/parents/logout-all',
    },

    // Admin Auth
    adminAuth: {
        login: '/api/v1/admin/auth/login',
    },

    // Grades
    grades: {
        list: '/api/grades',
        detail: (id: string) => `/api/grades/${id}`,
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
