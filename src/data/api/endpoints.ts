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
        login: '/api/v1/admins/auth/login',
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
        countries: '/api/countries',
        cities: (countryId: number) => `/api/countries/${countryId}/cities`,
    },
} as const;
