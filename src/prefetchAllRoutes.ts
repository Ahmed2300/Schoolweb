/**
 * prefetchAllRoutes — Role-aware background module preloader
 *
 * Only prefetches the routes relevant to the current user's role,
 * drastically cutting the initial request count from 60+ to ~10-15.
 *
 * Strategy:
 *  1. `requestIdleCallback` to avoid blocking first paint
 *  2. Small staggered batches of 4 to avoid network saturation
 *  3. Each import is individually caught
 *  4. Only loads current role routes (nothing for unauthenticated)
 */

type UserRole = 'student' | 'parent' | 'teacher' | 'admin' | null;

// ── Route imports grouped by role ─────────────────────────────

const studentImports: Array<() => Promise<unknown>> = [
    () => import('./presentation/pages/dashboard/StudentLayout'),
    () => import('./presentation/pages/dashboard/StudentHomePage'),
    () => import('./presentation/pages/dashboard/StudentCoursesPage'),
    () => import('./presentation/pages/dashboard/StudentCourseDetailPage'),
    () => import('./presentation/pages/dashboard/StudentSchedulePage'),
    () => import('./presentation/pages/dashboard/StudentQuizzesPage'),
    () => import('./presentation/pages/dashboard/StudentProfilePage'),
    () => import('./presentation/pages/dashboard/StudentPackagesPage'),
    () => import('./presentation/pages/dashboard/StudentParentRequestsPage'),
    () => import('./presentation/pages/student/LecturePlayerPage'),
];

const parentImports: Array<() => Promise<unknown>> = [
    () => import('./presentation/pages/dashboard/ParentLayout'),
    () => import('./presentation/pages/dashboard/ParentHomePage'),
    () => import('./presentation/pages/dashboard/ParentChildrenPage'),
    () => import('./presentation/pages/dashboard/ParentStorePage'),
    () => import('./presentation/pages/dashboard/ParentSettingsPage'),
    () => import('./presentation/pages/dashboard/ParentCourseProgressPage'),
];

const teacherImports: Array<() => Promise<unknown>> = [
    () => import('./presentation/components/teacher'),
    () => import('./presentation/pages/teacher/TeacherDashboardPage'),
    () => import('./presentation/pages/teacher/TeacherCoursesPage'),
    () => import('./presentation/pages/teacher/TeacherCourseDetailsPage'),
    () => import('./presentation/pages/teacher/TeacherQuizzesPage'),
    () => import('./presentation/pages/teacher/TeacherSettingsPage'),
    () => import('./presentation/pages/teacher/AnalyticsPage'),
    () => import('./presentation/pages/teacher/TeacherSlotRequestsPage'),
    () => import('./presentation/pages/teacher/TeacherWeeklySchedulePage'),
];

const adminImports: Array<() => Promise<unknown>> = [
    () => import('./presentation/components/admin'),
    () => import('./presentation/pages/admin/AdminDashboard'),
    () => import('./presentation/pages/admin/AdminAdminsPage'),
    () => import('./presentation/pages/admin/AdminUsersPage'),
    () => import('./presentation/pages/admin/AdminGradesPage'),
    () => import('./presentation/pages/admin/AdminCoursesPage'),
    () => import('./presentation/pages/admin/AdminCourseUnitsPage'),
    () => import('./presentation/pages/admin/AdminTeachersPage'),
    () => import('./presentation/pages/admin/AdminSubscriptionsPage'),
    () => import('./presentation/pages/admin/AdminReportsPage'),
    () => import('./presentation/pages/admin/AdminSettingsPage'),
    () => import('./presentation/pages/admin/AdminPaymentsPage'),
    () => import('./presentation/pages/admin/AdminSemestersPage'),
    () => import('./presentation/pages/admin/AdminSubjectsPage'),
    () => import('./presentation/pages/admin/AdminLecturesPage'),
    () => import('./presentation/pages/admin/packages/AdminPackagesPage'),
    () => import('./presentation/pages/admin/AdminPackageSubscriptionsPage'),
    () => import('./presentation/pages/admin/AdminAcademicGraphPage'),
    () => import('./presentation/pages/admin/AdminClientReportsPage'),
    () => import('./presentation/pages/admin/approvals/AdminContentApprovalsPage'),
    () => import('./presentation/pages/admin/quizzes/AdminQuizzesPage'),
    () => import('./presentation/pages/admin/AdminScheduleConfigPage'),
    () => import('./presentation/pages/admin/AdminSlotRequestsPage'),
    () => import('./presentation/pages/admin/AdminClassSchedulesPage'),
    () => import('./presentation/pages/admin/AdminStudentDetailsPage'),
    () => import('./presentation/pages/admin/AdminParentDetailsPage'),
];

// ── Batch executor ──────────────────────────────────────────

const BATCH_SIZE = 4;
const BATCH_DELAY_MS = 150;

async function executeBatch(batch: Array<() => Promise<unknown>>): Promise<void> {
    await Promise.allSettled(batch.map((fn) => fn()));
}

async function prefetchSequentially(imports: Array<() => Promise<unknown>>): Promise<void> {
    for (let i = 0; i < imports.length; i += BATCH_SIZE) {
        const batch = imports.slice(i, i + BATCH_SIZE);
        await executeBatch(batch);
        if (i + BATCH_SIZE < imports.length) {
            await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
        }
    }
}

// ── Public API ──────────────────────────────────────────────

/**
 * Prefetch route modules relevant to the current user role.
 *
 * - Unauthenticated: nothing (landing page loads its own deps)
 * - Student: ~10 chunks
 * - Admin: ~26 chunks
 *
 * Call once after the app has rendered its first paint.
 */
export function prefetchAllRoutes(role: UserRole = null): void {
    if (!role) {
        // Not logged in: don't prefetch anything.
        // The landing page loads what it needs; auth pages load lazily on navigate.
        return;
    }

    const start = () => {
        const imports: Array<() => Promise<unknown>> = [];

        switch (role) {
            case 'student':
                imports.push(...studentImports);
                break;
            case 'parent':
                imports.push(...parentImports);
                break;
            case 'teacher':
                imports.push(...teacherImports);
                break;
            case 'admin':
                imports.push(...adminImports);
                break;
        }

        prefetchSequentially(imports).catch(() => {
            // Silently swallow — individual import errors are already
            // handled by `allSettled`; this catch is a safety net.
        });
    };

    // Use requestIdleCallback to avoid blocking interactivity
    if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(start, { timeout: 4000 });
    } else {
        // Safari / older browsers — short fallback delay
        setTimeout(start, 2000);
    }
}
