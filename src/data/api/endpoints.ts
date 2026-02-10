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
        homeDashboard: '/api/v1/students/home-dashboard',
        updateProfile: '/api/v1/students/auth/me',
        refresh: '/api/v1/students/auth/refresh',
        changePassword: '/api/v1/students/auth/change-password',
        logout: '/api/v1/students/auth/logout',
        logoutAll: '/api/v1/students/auth/logout-all',
        generateUid: '/api/v1/students/auth/generate-uid',
    },

    // Student Dashboard
    student: {
        // Parent link requests (from student perspective)
        parentRequests: {
            list: '/api/v1/students/parent-requests',
            show: (id: number) => `/api/v1/students/parent-requests/${id}`,
            updateStatus: (id: number) => `/api/v1/students/parent-requests/${id}/status`,
        },
    },

    // Parent Auth
    parentAuth: {
        register: '/api/v1/auth/parents/register',
        login: '/api/v1/auth/parents/login',
        verifyEmail: '/api/v1/auth/parents/verify-email',
        resendOtp: '/api/v1/auth/parents/resend-otp',
        me: '/api/v1/parents/auth/me',
        updateProfile: '/api/v1/user/profile/update',
        refresh: '/api/v1/parents/auth/refresh',
        changePassword: '/api/v1/parents/auth/change-password',
        forgotPassword: '/api/v1/auth/parents/forgot-password',
        resetPassword: '/api/v1/auth/parents/reset-password',
        logout: '/api/v1/parents/auth/logout',
        logoutAll: '/api/v1/parents/auth/logout-all',
    },

    // Parent Dashboard
    parent: {
        // Student search & linking
        searchStudent: '/api/v1/parents/students/search',
        studentRequests: {
            list: '/api/v1/parents/student-requests',
            create: '/api/v1/parents/student-requests',
            show: (id: number) => `/api/v1/parents/student-requests/${id}`,
            updateStatus: (id: number) => `/api/v1/parents/student-requests/${id}/status`,
        },
        // Reports
        reports: {
            students: '/api/v1/parents/reports/students',
            studentDetail: (id: number) => `/api/v1/parents/reports/students/${id}`,
        },
        // Unlink student
        unlinkStudent: (studentId: number) => `/api/v1/parents/students/${studentId}/unlink`,
    },

    // Teacher Auth
    teacherAuth: {
        // Public routes
        register: '/api/v1/auth/teachers/register',
        login: '/api/v1/auth/teachers/login',
        verifyEmail: '/api/v1/auth/teachers/verify-email',
        resendOtp: '/api/v1/auth/teachers/resend-otp',
        forgotPassword: '/api/v1/auth/teachers/forgot-password',
        resetPassword: '/api/v1/auth/teachers/reset-password',
        // Protected routes
        me: '/api/v1/auth/teachers/me',
        updateProfile: '/api/v1/auth/teachers/update-profile',
        refresh: '/api/v1/auth/teachers/refresh',
        changePassword: '/api/v1/auth/teachers/change-password',
        logout: '/api/v1/auth/teachers/logout',
        logoutAll: '/api/v1/auth/teachers/logout-all',
    },

    // Teacher Dashboard & Courses (authenticated teacher)
    teacher: {
        // My Courses - Teacher's own courses
        myCourses: {
            list: '/api/v1/my-courses',
            create: '/api/v1/my-courses',
            show: (id: number) => `/api/v1/my-courses/${id}`,
            update: (id: number) => `/api/v1/my-courses/${id}`,
            delete: (id: number) => `/api/v1/my-courses/${id}`,
            // Nested units endpoints
            units: {
                list: (courseId: number) => `/api/v1/my-courses/${courseId}/units`,
                create: (courseId: number) => `/api/v1/my-courses/${courseId}/units`,
                show: (courseId: number, unitId: number) => `/api/v1/my-courses/${courseId}/units/${unitId}`,
                update: (courseId: number, unitId: number) => `/api/v1/my-courses/${courseId}/units/${unitId}`,
                delete: (courseId: number, unitId: number) => `/api/v1/my-courses/${courseId}/units/${unitId}`,
                reorder: (courseId: number) => `/api/v1/my-courses/${courseId}/units/reorder`,
                reorderLectures: (courseId: number, unitId: number) => `/api/v1/my-courses/${courseId}/units/${unitId}/reorder-lectures`,
                reorderContent: (courseId: number, unitId: number) => `/api/v1/my-courses/${courseId}/units/${unitId}/reorder-content`,
            },
            // Enrolled students endpoint
            students: (courseId: number) => `/api/v1/my-courses/${courseId}/students`,
        },
        // Quizzes - Teacher's quizzes
        quizzes: {
            list: '/api/v1/teacher/quizzes',
            create: '/api/v1/teacher/quizzes',
            show: (id: number) => `/api/v1/teacher/quizzes/${id}`,
            update: (id: number) => `/api/v1/teacher/quizzes/${id}`,
            delete: (id: number) => `/api/v1/teacher/quizzes/${id}`,
        },
        // Time Slots - Teacher's slot management
        timeSlots: {
            available: '/api/v1/teacher/timeslots',
            request: (id: number) => `/api/v1/teacher/timeslots/${id}/request`,
            myRequests: '/api/v1/teacher/timeslots/my-requests',
            cancelAll: '/api/v1/teacher/timeslots/cancel-all',
            cancel: (id: number) => `/api/v1/teacher/timeslots/${id}/cancel`,
            show: (id: number) => `/api/v1/teacher/timeslots/${id}`,
        },
        // Teacher Recurring Schedule (Slots 2.0)
        recurringSchedule: {
            assignedGrades: '/api/v1/teacher/recurring-schedule/assigned-grades',
            weekConfig: '/api/v1/teacher/recurring-schedule/week-config',
            availableSlots: '/api/v1/teacher/recurring-schedule/available-slots',
            submitSlot: '/api/v1/teacher/recurring-schedule/submit-slot',
            mySchedule: '/api/v1/teacher/recurring-schedule/my-schedule',
            cancelSlot: '/api/v1/teacher/recurring-schedule/cancel-slot',
            vacantSlots: '/api/v1/teacher/recurring-schedule/vacant-slots',
            requestExtra: '/api/v1/teacher/recurring-schedule/request-extra-slot',
        },
        // Lectures
        lectures: {
            list: '/api/v1/lectures',
            create: '/api/v1/lectures',
            show: (id: number) => `/api/v1/lectures/${id}`,
            update: (id: number) => `/api/v1/lectures/${id}`,
            delete: (id: number) => `/api/v1/lectures/${id}`,
            chunkedCreate: '/api/v1/lectures/chunked-create',
            chunkedUpdate: (id: number) => `/api/v1/lectures/${id}/chunked-update`,
            dashboardSchedule: '/api/v1/teacher/dashboard-schedule',
            stats: '/api/v1/teacher/stats',
        },
        // Video Upload
        videos: {
            initiate: '/api/v1/videos/initiate',
            chunk: '/api/v1/videos/chunk',
            complete: '/api/v1/videos/complete',
            progress: '/api/v1/videos/progress',
            cancel: '/api/v1/videos/cancel',
        },
        // Content Approval Requests
        contentApprovals: {
            list: '/api/v1/content-approvals',
            create: '/api/v1/content-approvals',
            show: (id: number) => `/api/v1/content-approvals/${id}`,
            delete: (id: number) => `/api/v1/content-approvals/${id}`,
            pendingCount: (courseId: number) => `/api/v1/content-approvals/pending-count/${courseId}`,
        },

        // Slot Requests (New System)
        slotRequests: {
            list: '/api/v1/schedule/requests',
            create: '/api/v1/schedule/requests',
            stats: '/api/v1/schedule/requests/stats',
            show: (id: number) => `/api/v1/schedule/requests/${id}`,
            cancel: (id: number) => `/api/v1/schedule/requests/${id}`,
        },
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
        semesters: {
            list: '/api/v1/admin/semesters',
            create: '/api/v1/admin/semesters',
            show: (id: number) => `/api/v1/admin/semesters/${id}`,
            update: (id: number) => `/api/v1/admin/semesters/${id}`,
            delete: (id: number) => `/api/v1/admin/semesters/${id}`,
        },
        // Schedule Settings
        schedule: {
            getSettings: (gradeId: number) => `/api/v1/admin/schedule/settings/${gradeId}`,
            saveSettings: (gradeId: number) => `/api/v1/admin/schedule/settings/${gradeId}`,
            getSlots: (semesterId: number) => `/api/v1/admin/schedule/slots/${semesterId}`,
            generateSlots: (semesterId: number) => `/api/v1/admin/schedule/generate/${semesterId}`,
            resetDaySlots: '/api/v1/admin/schedule/reset-day-slots',
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
        // Units (Course curriculum organization)
        units: {
            list: (courseId: number) => `/api/v1/admin/courses/${courseId}/units`,
            create: (courseId: number) => `/api/v1/admin/courses/${courseId}/units`,
            show: (courseId: number, unitId: number) => `/api/v1/admin/courses/${courseId}/units/${unitId}`,
            update: (courseId: number, unitId: number) => `/api/v1/admin/courses/${courseId}/units/${unitId}`,
            delete: (courseId: number, unitId: number) => `/api/v1/admin/courses/${courseId}/units/${unitId}`,
            reorder: (courseId: number) => `/api/v1/admin/courses/${courseId}/units/reorder`,
            moveLecture: (unitId: number) => `/api/v1/admin/units/${unitId}/move-lecture`,
            reorderLectures: (unitId: number) => `/api/v1/admin/units/${unitId}/reorder-lectures`,
            togglePublish: (unitId: number) => `/api/v1/admin/units/${unitId}/toggle-publish`,
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
            upsert: '/api/v1/admin/settings/upsert',
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
        // Time Slots Management
        timeSlots: {
            list: '/api/v1/admin/timeslots',
            create: '/api/v1/admin/timeslots',
            show: (id: number) => `/api/v1/admin/timeslots/${id}`,
            update: (id: number) => `/api/v1/admin/timeslots/${id}`,
            delete: (id: number) => `/api/v1/admin/timeslots/${id}`,
            pending: '/api/v1/admin/timeslots-pending',
            stats: '/api/v1/admin/timeslots-stats',
            approve: (id: number) => `/api/v1/admin/timeslots/${id}/approve`,
            reject: (id: number) => `/api/v1/admin/timeslots/${id}/reject`,
            bulkCreate: '/api/v1/admin/timeslots-bulk',
            deleteAll: '/api/v1/admin/timeslots-all',
        },
        // Content Approval Management
        contentApprovals: {
            list: '/api/v1/admin/content-approvals',
            stats: '/api/v1/admin/content-approvals/stats',
            show: (id: number) => `/api/v1/admin/content-approvals/${id}`,
            approve: (id: number) => `/api/v1/admin/content-approvals/${id}/approve`,
            reject: (id: number) => `/api/v1/admin/content-approvals/${id}/reject`,
        },
        // Quizzes
        quizzes: {
            list: '/api/v1/admin/quizzes',
            show: (id: number) => `/api/v1/admin/quizzes/${id}`,
            approve: (id: number) => `/api/v1/admin/quizzes/${id}/approve`,
            reject: (id: number) => `/api/v1/admin/quizzes/${id}/reject`,
        },
        // Slot Requests (Teacher Schedule Requests) - NEW SYSTEM
        slotRequests: {
            list: '/api/v1/admin/schedule/requests',
            show: (id: number) => `/api/v1/admin/schedule/requests/${id}`,
            stats: '/api/v1/admin/schedule/requests/stats',
            approve: (id: number) => `/api/v1/admin/schedule/requests/${id}/approve`,
            reject: (id: number) => `/api/v1/admin/schedule/requests/${id}/reject`,
            bulkApprove: '/api/v1/admin/schedule/requests/bulk-approve',
            bulkReject: '/api/v1/admin/schedule/requests/bulk-reject',
        },
        // Class Schedules (View Only)
        classSchedules: {
            list: '/api/v1/admin/class-schedules',
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
        update: (id: number) => `/api/v1/students/schedules/${id}`,
        complete: (id: number) => `/api/v1/students/schedules/${id}/complete`,
        delete: (id: number) => `/api/v1/students/schedules/${id}`,
    },



    // Packages
    packages: {
        // Public/Student routes
        list: '/api/v1/packages',
        detail: (id: number) => `/api/v1/packages/${id}`,
        purchase: (id: number) => `/api/v1/packages/${id}/purchase`,
        checkPurchase: (id: number) => `/api/v1/packages/${id}/check-purchase`,
        mySubscriptions: '/api/v1/my-package-subscriptions',
        // Admin routes
        create: '/api/v1/packages',
        update: (id: number) => `/api/v1/packages/${id}`,
        delete: (id: number) => `/api/v1/packages/${id}`,
        attachCourses: (id: number) => `/api/v1/packages/${id}/attach-courses`,
        detachCourses: (id: number) => `/api/v1/packages/${id}/detach-courses`,
        subscriptions: '/api/v1/package-subscriptions',
        pendingSubscriptions: '/api/v1/package-subscriptions/pending',
        approveSubscription: (id: number) => `/api/v1/package-subscriptions/${id}/approve`,
        rejectSubscription: (id: number) => `/api/v1/package-subscriptions/${id}/reject`,
    },

    // User Notifications (Shared)
    notifications: {
        list: '/api/user/notifications',
        unreadCount: '/api/user/notifications/unread',
        markAsRead: '/api/user/notifications/mark-as-read',
        markAllAsRead: '/api/user/notifications/mark-all-as-read',
        delete: (id: string) => `/api/user/notifications/${id}`,
    },
} as const;
