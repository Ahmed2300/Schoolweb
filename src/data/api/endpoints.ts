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
        // Roles
        roles: {
            list: '/api/v1/admin/roles',
            create: '/api/v1/admin/roles',
            show: (id: number) => `/api/v1/admin/roles/${id}`,
            update: (id: number) => `/api/v1/admin/roles/${id}`,
            delete: (id: number) => `/api/v1/admin/roles/${id}`,
        },
        // Subjects
        subjects: {
            list: '/api/v1/admin/subjects',
            create: '/api/v1/admin/subjects',
            show: (id: number) => `/api/v1/admin/subjects/${id}`,
            update: (id: number) => `/api/v1/admin/subjects/${id}`,
            delete: (id: number) => `/api/v1/admin/subjects/${id}`,
        },
        // Grades
        grades: {
            list: '/api/v1/admin/grades',
            create: '/api/v1/admin/grades',
            show: (id: number) => `/api/v1/admin/grades/${id}`,
            update: (id: number) => `/api/v1/admin/grades/${id}`,
            delete: (id: number) => `/api/v1/admin/grades/${id}`,
        },
        // Semesters
        semesters: {
            list: '/api/v1/admin/semesters',
            create: '/api/v1/admin/semesters',
            show: (id: number) => `/api/v1/admin/semesters/${id}`,
            update: (id: number) => `/api/v1/admin/semesters/${id}`,
            delete: (id: number) => `/api/v1/admin/semesters/${id}`,
        },
        // Courses
        courses: {
            list: '/api/v1/admin/courses',
            create: '/api/v1/admin/courses',
            show: (id: number) => `/api/v1/admin/courses/${id}`,
            update: (id: number) => `/api/v1/admin/courses/${id}`,
            delete: (id: number) => `/api/v1/admin/courses/${id}`,
        },
        // Lectures
        lectures: {
            list: '/api/v1/admin/lectures',
            create: '/api/v1/admin/lectures',
            show: (id: number) => `/api/v1/admin/lectures/${id}`,
            update: (id: number) => `/api/v1/admin/lectures/${id}`,
            delete: (id: number) => `/api/v1/admin/lectures/${id}`,
            chunkedCreate: '/api/v1/admin/lectures/chunked-create',
            chunkedUpdate: (id: number) => `/api/v1/admin/lectures/${id}/chunked-update`,
        },
        // Countries
        countries: {
            list: '/api/v1/admin/countries',
            create: '/api/v1/admin/countries',
            show: (id: number) => `/api/v1/admin/countries/${id}`,
            update: (id: number) => `/api/v1/admin/countries/${id}`,
            delete: (id: number) => `/api/v1/admin/countries/${id}`,
        },
        // Cities
        cities: {
            list: '/api/v1/admin/cities',
            create: '/api/v1/admin/cities',
            show: (id: number) => `/api/v1/admin/cities/${id}`,
            update: (id: number) => `/api/v1/admin/cities/${id}`,
            delete: (id: number) => `/api/v1/admin/cities/${id}`,
        },
        // Settings
        settings: {
            list: '/api/v1/admin/settings',
            create: '/api/v1/admin/settings',
            show: (id: number) => `/api/v1/admin/settings/${id}`,
            update: (id: number) => `/api/v1/admin/settings/${id}`,
            delete: (id: number) => `/api/v1/admin/settings/${id}`,
            uploadLogo: '/api/v1/admin/settings/upload-logo',
        },
        // Reports
        reports: {
            studentRegistrations: '/api/v1/admin/reports/student-registrations',
            teacherRegistrations: '/api/v1/admin/reports/teacher-registrations',
            parentRegistrations: '/api/v1/admin/reports/parent-registrations',
            recentRegistrations: '/api/v1/admin/reports/recent-registrations',
        },
        // Activity Logs
        activityLogs: {
            list: '/api/v1/admin/activity-logs',
        },
        // Video Upload
        videos: {
            initiate: '/api/v1/admin/videos/initiate',
            chunk: '/api/v1/admin/videos/chunk',
            complete: '/api/v1/admin/videos/complete',
            progress: '/api/v1/admin/videos/progress',
            cancel: '/api/v1/admin/videos/cancel',
        },
        // Student-Parent Assignment
        studentParent: {
            assign: '/api/v1/admin/student-parent/assign',
            update: (studentId: number) => `/api/v1/admin/student-parent/${studentId}`,
            remove: (studentId: number) => `/api/v1/admin/student-parent/${studentId}`,
        },
        // Payments
        payments: {
            list: '/api/v1/admin/payments',
            create: '/api/v1/admin/payments',
            show: (id: number) => `/api/v1/admin/payments/${id}`,
            update: (id: number) => `/api/v1/admin/payments/${id}`,
            delete: (id: number) => `/api/v1/admin/payments/${id}`,
            approve: (id: number) => `/api/v1/admin/payments/${id}/approve`,
            reject: (id: number) => `/api/v1/admin/payments/${id}/reject`,
            statistics: '/api/v1/admin/payments/statistics/summary',
        },
    },

    // Grades (authenticated)
    grades: {
        list: '/api/v1/grades',
        detail: (id: number) => `/api/v1/grades/${id}`,
        semestersByGrade: (gradeId: number) => `/api/v1/grades/semsters/by/grade/${gradeId}`,
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
        cities: (countryId: number) => `/api/v1/cities?country_id=${countryId}`,
    },

    // Courses
    courses: {
        list: '/api/v1/courses',
        detail: (id: string) => `/api/v1/courses/${id}`,
        search: '/api/v1/courses/search',
        enrolled: '/api/v1/courses/enrolled', // TODO: Implement in backend
        featured: '/api/v1/courses/featured', // TODO: Implement in backend
        recommended: '/api/v1/courses/recommended', // TODO: Implement in backend
        create: '/api/v1/courses',
        update: (id: string) => `/api/v1/courses/${id}`,
        delete: (id: string) => `/api/v1/courses/${id}`,
        publish: (id: string) => `/api/v1/courses/${id}/publish`,
    },

    // Student Subscriptions
    subscriptions: {
        list: '/api/v1/students/subscriptions',
        create: '/api/v1/students/subscriptions',
        cancel: (id: string) => `/api/v1/students/subscriptions/${id}`,
        uploadBill: (id: string) => `/api/v1/students/subscriptions/${id}/bill-image`,
        detail: (id: string) => `/api/v1/students/subscriptions/${id}`,
        checkAccess: '/api/v1/students/subscriptions/check-access',
        request: '/api/v1/students/subscriptions/request',
        pending: '/api/v1/admin/subscriptions?status=pending',
        approve: (id: string) => `/api/v1/admin/subscriptions/${id}/activate`,
        reject: (id: string) => `/api/v1/admin/subscriptions/${id}/reject`,
    },

    // Student Schedules
    schedules: {
        list: '/api/v1/students/schedules',
        create: '/api/v1/students/schedules',
        complete: (id: number) => `/api/v1/students/schedules/${id}/complete`,
        delete: (id: number) => `/api/v1/students/schedules/${id}`,
    },
} as const;
