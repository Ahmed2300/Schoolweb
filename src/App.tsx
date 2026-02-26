import { lazy, Suspense, useEffect, type ComponentType } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ROUTES } from './shared/constants';
import { FullPageSkeleton } from './presentation/components/common/FullPageSkeleton';
import { prefetchAllRoutes } from './prefetchAllRoutes';
import { useAuthStore } from './presentation/store/authStore';
import './shared/i18n';
import './index.css';

// ─────────────────────────────────────────────────────────────
// lazyWithRetry — Production-grade lazy loader.
//
// Problem: After a new deployment, Vite generates new chunk
// hashes. Users with stale HTML reference old chunk URLs that
// now 404. React.lazy fails silently, startTransition holds
// the old page, and the app appears "stuck."
//
// Solution (3 layers):
//  1. Retry the import up to 3× with 1-second intervals
//  2. If all retries fail → force a full page reload to get
//     fresh HTML with updated chunk references
//  3. sessionStorage flag prevents infinite reload loops
// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// lazyWithRetry — Production-grade lazy loader.
//
// Problem: After a new deployment, Vite generates new chunk
// hashes. Users with stale HTML reference old chunk URLs that
// now 404. React.lazy fails silently, startTransition holds
// the old page, and the app appears "stuck."
//
// Solution (3 layers):
//  1. Retry the import once with a 500ms delay
//  2. If retry fails → force a cache-busting page reload
//  3. URL param `_reload=1` prevents infinite reload loops
//     (survives mobile tab kills, unlike sessionStorage)
// ─────────────────────────────────────────────────────────────
function lazyWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
) {
  return lazy(() => {
    return importFn()
      .catch(() => {
        // First failure — retry once after 500ms
        return new Promise<{ default: T }>((resolve) =>
          setTimeout(() => resolve(importFn()), 500),
        );
      })
      .catch((error: unknown) => {
        // Both attempts failed — likely a stale deployment
        const url = new URL(window.location.href);
        const alreadyReloaded = url.searchParams.has('_reload');

        if (!alreadyReloaded) {
          // Force a cache-busting full page reload
          url.searchParams.set('_reload', '1');
          url.searchParams.set('_t', String(Date.now()));
          window.location.replace(url.toString());
          // Never-resolving promise to prevent React from rendering
          return new Promise<{ default: T }>(() => { });
        }

        // Already reloaded once and still failing — throw to error boundary
        throw error;
      });
  });
}

// Clean up reload params on successful app load
if (typeof window !== 'undefined') {
  const url = new URL(window.location.href);
  if (url.searchParams.has('_reload')) {
    url.searchParams.delete('_reload');
    url.searchParams.delete('_t');
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
  }
}

// ─────────────────────────────────────────────────────────────
// Non-lazy: lightweight wrappers & providers (tiny footprint)
// ─────────────────────────────────────────────────────────────
// Layouts are lazy-loaded (each has its own internal <Suspense> + <Outlet>)
const AdminLayout = lazyWithRetry(() => import('./presentation/components/admin').then(m => ({ default: m.AdminLayout })));
const TeacherLayout = lazyWithRetry(() => import('./presentation/components/teacher').then(m => ({ default: m.TeacherLayout })));

import { ProtectedRoute } from './presentation/components/auth';
import { MaintenanceWrapper } from './presentation/components/MaintenanceWrapper';
import { SmoothScrollWrapper } from './presentation/components/SmoothScrollWrapper';
import { ScrollToTop } from './presentation/components/common/ScrollToTop';

import { ThemeProvider } from './context/ThemeContext';
import { useSessionEnforcement } from './hooks/useSessionEnforcement';
import 'lenis/dist/lenis.css';

// ─────────────────────────────────────────────────────────────
// React.lazy — Each page is a separate chunk loaded on demand.
// The prefetchAllRoutes() system downloads ALL chunks in the
// background after first paint, so by the time the user clicks
// anything, the chunks are already cached and resolve instantly.
// ─────────────────────────────────────────────────────────────

// Public / Landing
const LandingPage = lazyWithRetry(() => import('./presentation/pages/landing/LandingPage').then(m => ({ default: m.LandingPage })));
const FeaturesPage = lazyWithRetry(() => import('./presentation/pages/landing/FeaturesPage').then(m => ({ default: m.FeaturesPage })));
const PrivacyPolicyPage = lazyWithRetry(() => import('./presentation/pages/landing/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const TermsAndConditionsPage = lazyWithRetry(() => import('./presentation/pages/landing/TermsAndConditionsPage').then(m => ({ default: m.TermsAndConditionsPage })));
const TechSupportPage = lazyWithRetry(() => import('./presentation/pages/landing/TechSupportPage').then(m => ({ default: m.TechSupportPage })));
const ContactPage = lazyWithRetry(() => import('./presentation/pages/ContactPage').then(m => ({ default: m.ContactPage })));
const NotFoundPage = lazyWithRetry(() => import('./presentation/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Auth
const SignInPage = lazyWithRetry(() => import('./presentation/pages/auth/SignInPage').then(m => ({ default: m.SignInPage })));
const SignupPage = lazyWithRetry(() => import('./presentation/pages/auth/SignupPage').then(m => ({ default: m.SignupPage })));
const VerifyEmailPage = lazyWithRetry(() => import('./presentation/pages/auth/VerifyEmailPage').then(m => ({ default: m.VerifyEmailPage })));
const ForgotPasswordPage = lazyWithRetry(() => import('./presentation/pages/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazyWithRetry(() => import('./presentation/pages/auth/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const AdminLoginPage = lazyWithRetry(() => import('./presentation/pages/auth/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const TeacherVerifyEmailPage = lazyWithRetry(() => import('./presentation/pages/auth/TeacherVerifyEmailPage').then(m => ({ default: m.TeacherVerifyEmailPage })));

// Student Dashboard
const StudentLayout = lazyWithRetry(() => import('./presentation/pages/dashboard/StudentLayout').then(m => ({ default: m.StudentLayout })));
const StudentHomePage = lazyWithRetry(() => import('./presentation/pages/dashboard/StudentHomePage').then(m => ({ default: m.StudentHomePage })));
const StudentCoursesPage = lazyWithRetry(() => import('./presentation/pages/dashboard/StudentCoursesPage').then(m => ({ default: m.StudentCoursesPage })));
const StudentCourseDetailPage = lazyWithRetry(() => import('./presentation/pages/dashboard/StudentCourseDetailPage').then(m => ({ default: m.StudentCourseDetailPage })));
const StudentSchedulePage = lazyWithRetry(() => import('./presentation/pages/dashboard/StudentSchedulePage').then(m => ({ default: m.StudentSchedulePage })));
const StudentQuizzesPage = lazyWithRetry(() => import('./presentation/pages/dashboard/StudentQuizzesPage').then(m => ({ default: m.StudentQuizzesPage })));
const StudentLivePage = lazyWithRetry(() => import('./presentation/pages/dashboard/StudentLivePage').then(m => ({ default: m.StudentLivePage })));
const StudentProfilePage = lazyWithRetry(() => import('./presentation/pages/dashboard/StudentProfilePage').then(m => ({ default: m.StudentProfilePage })));
const StudentPackagesPage = lazyWithRetry(() => import('./presentation/pages/dashboard/StudentPackagesPage').then(m => ({ default: m.StudentPackagesPage })));
const StudentParentRequestsPage = lazyWithRetry(() => import('./presentation/pages/dashboard/StudentParentRequestsPage').then(m => ({ default: m.StudentParentRequestsPage })));
const LecturePlayerPage = lazyWithRetry(() => import('./presentation/pages/student/LecturePlayerPage').then(m => ({ default: m.LecturePlayerPage })));

// Parent Dashboard
const ParentLayout = lazyWithRetry(() => import('./presentation/pages/dashboard/ParentLayout').then(m => ({ default: m.ParentLayout })));
const ParentHomePage = lazyWithRetry(() => import('./presentation/pages/dashboard/ParentHomePage').then(m => ({ default: m.ParentHomePage })));
const ParentChildrenPage = lazyWithRetry(() => import('./presentation/pages/dashboard/ParentChildrenPage').then(m => ({ default: m.ParentChildrenPage })));
const ParentStorePage = lazyWithRetry(() => import('./presentation/pages/dashboard/ParentStorePage').then(m => ({ default: m.ParentStorePage })));
const ParentSettingsPage = lazyWithRetry(() => import('./presentation/pages/dashboard/ParentSettingsPage').then(m => ({ default: m.ParentSettingsPage })));
const ParentCourseProgressPage = lazyWithRetry(() => import('./presentation/pages/dashboard/ParentCourseProgressPage').then(m => ({ default: m.ParentCourseProgressPage })));

// Teacher Dashboard
const TeacherDashboardPage = lazyWithRetry(() => import('./presentation/pages/teacher/TeacherDashboardPage').then(m => ({ default: m.TeacherDashboardPage })));
const TeacherCoursesPage = lazyWithRetry(() => import('./presentation/pages/teacher/TeacherCoursesPage').then(m => ({ default: m.TeacherCoursesPage })));
const TeacherCourseDetailsPage = lazyWithRetry(() => import('./presentation/pages/teacher/TeacherCourseDetailsPage').then(m => ({ default: m.TeacherCourseDetailsPage })));
const TeacherQuizzesPage = lazyWithRetry(() => import('./presentation/pages/teacher/TeacherQuizzesPage').then(m => ({ default: m.TeacherQuizzesPage })));
const TeacherSettingsPage = lazyWithRetry(() => import('./presentation/pages/teacher/TeacherSettingsPage').then(m => ({ default: m.TeacherSettingsPage })));
const TeacherAnalyticsPage = lazyWithRetry(() => import('./presentation/pages/teacher/AnalyticsPage').then(m => ({ default: m.TeacherAnalyticsPage })));
const TeacherSlotRequestsPage = lazyWithRetry(() => import('./presentation/pages/teacher/TeacherSlotRequestsPage').then(m => ({ default: m.TeacherSlotRequestsPage })));
const TeacherWeeklySchedulePage = lazyWithRetry(() => import('./presentation/pages/teacher/TeacherWeeklySchedulePage'));

// Admin Dashboard
const AdminDashboard = lazyWithRetry(() => import('./presentation/pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminAdminsPage = lazyWithRetry(() => import('./presentation/pages/admin/AdminAdminsPage').then(m => ({ default: m.AdminAdminsPage })));
const AdminUsersPage = lazyWithRetry(() => import('./presentation/pages/admin/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })));
const AdminGradesPage = lazyWithRetry(() => import('./presentation/pages/admin/AdminGradesPage').then(m => ({ default: m.AdminGradesPage })));
const AdminCoursesPage = lazyWithRetry(() => import('./presentation/pages/admin/AdminCoursesPage').then(m => ({ default: m.AdminCoursesPage })));
const AdminCourseUnitsPage = lazyWithRetry(() => import('./presentation/pages/admin/AdminCourseUnitsPage').then(m => ({ default: m.AdminCourseUnitsPage })));
const AdminTeachersPage = lazyWithRetry(() => import('./presentation/pages/admin/AdminTeachersPage').then(m => ({ default: m.AdminTeachersPage })));
const AdminSubscriptionsPage = lazyWithRetry(() => import('./presentation/pages/admin/AdminSubscriptionsPage').then(m => ({ default: m.AdminSubscriptionsPage })));
const AdminReportsPage = lazyWithRetry(() => import('./presentation/pages/admin/AdminReportsPage').then(m => ({ default: m.AdminReportsPage })));
const AdminSettingsPage = lazyWithRetry(() => import('./presentation/pages/admin/AdminSettingsPage').then(m => ({ default: m.AdminSettingsPage })));
const AdminPaymentsPage = lazyWithRetry(() => import('./presentation/pages/admin/AdminPaymentsPage').then(m => ({ default: m.AdminPaymentsPage })));
const AdminSemestersPage = lazyWithRetry(() => import('./presentation/pages/admin/AdminSemestersPage').then(m => ({ default: m.AdminSemestersPage })));
const AdminSubjectsPage = lazyWithRetry(() => import('./presentation/pages/admin/AdminSubjectsPage').then(m => ({ default: m.AdminSubjectsPage })));
const AdminLecturesPage = lazyWithRetry(() => import('./presentation/pages/admin/AdminLecturesPage').then(m => ({ default: m.AdminLecturesPage })));
const AdminPackagesPage = lazyWithRetry(() => import('./presentation/pages/admin/packages/AdminPackagesPage').then(m => ({ default: m.AdminPackagesPage })));
const AdminPackageSubscriptionsPage = lazyWithRetry(() => import('./presentation/pages/admin/AdminPackageSubscriptionsPage').then(m => ({ default: m.AdminPackageSubscriptionsPage })));
const AdminAcademicGraphPage = lazyWithRetry(() => import('./presentation/pages/admin/AdminAcademicGraphPage'));
const AdminClientReportsPage = lazyWithRetry(() => import('./presentation/pages/admin/AdminClientReportsPage').then(m => ({ default: m.AdminClientReportsPage })));
const AdminContentApprovalsPage = lazyWithRetry(() => import('./presentation/pages/admin/approvals/AdminContentApprovalsPage').then(m => ({ default: m.AdminContentApprovalsPage })));
const AdminQuizzesPage = lazyWithRetry(() => import('./presentation/pages/admin/quizzes/AdminQuizzesPage').then(m => ({ default: m.AdminQuizzesPage })));
const AdminScheduleConfigPage = lazyWithRetry(() => import('./presentation/pages/admin/AdminScheduleConfigPage').then(m => ({ default: m.AdminScheduleConfigPage })));
const AdminSlotRequestsPage = lazyWithRetry(() => import('./presentation/pages/admin/AdminSlotRequestsPage').then(m => ({ default: m.AdminSlotRequestsPage })));
const AdminClassSchedulesPage = lazyWithRetry(() => import('./presentation/pages/admin/AdminClassSchedulesPage').then(m => ({ default: m.AdminClassSchedulesPage })));
const AdminStudentDetailsPage = lazyWithRetry(() => import('./presentation/pages/admin/AdminStudentDetailsPage'));
const AdminParentDetailsPage = lazyWithRetry(() => import('./presentation/pages/admin/AdminParentDetailsPage'));

// Classroom (standalone route)
const LiveClassroomPage = lazyWithRetry(() => import('./presentation/pages/classroom/LiveClassroomPage'));

// ─────────────────────────────────────────────────────────────
// Session Enforcer (WebSocket force-logout listener)
// ─────────────────────────────────────────────────────────────
function SessionEnforcer() {
  useSessionEnforcement();
  return null;
}

// ─────────────────────────────────────────────────────────────
// AppRoutes — Route tree.
//
// Each layout component (StudentLayout, ParentLayout,
// TeacherLayout, AdminLayout) has its own internal
// <Suspense fallback={skeleton}><Outlet /></Suspense>,
// so child-route navigations within a layout show a branded
// content skeleton while the next chunk loads.
//
// The top-level <Suspense> here handles full-page transitions
// (e.g. landing → login, or login → dashboard layout).
//
// prefetchAllRoutes() downloads ALL 60+ chunks in staggered
// background batches after first paint, so by the time the
// user clicks anything, the chunks are already cached and
// React.lazy resolves instantly.
// ─────────────────────────────────────────────────────────────
function AppRoutes() {
  const role = useAuthStore((s) => s.user?.role ?? null);

  // Prefetch only the route modules relevant to the current user's role.
  useEffect(() => {
    prefetchAllRoutes(role);
  }, [role]);

  return (
    <Suspense fallback={<FullPageSkeleton />}>
      <Routes>
        {/* Public routes */}
        <Route path={ROUTES.HOME} element={<LandingPage />} />
        <Route path={ROUTES.FEATURES} element={<FeaturesPage />} />
        <Route path={ROUTES.CONTACT} element={<ContactPage />} />
        <Route path={ROUTES.TECH_SUPPORT} element={<TechSupportPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
        <Route path={ROUTES.LOGIN} element={<SignInPage />} />
        <Route path={ROUTES.REGISTER} element={<SignupPage />} />
        <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
        <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLoginPage />} />
        <Route path={ROUTES.TEACHER_LOGIN} element={<AdminLoginPage />} />
        <Route path={ROUTES.TEACHER_VERIFY_EMAIL} element={<TeacherVerifyEmailPage />} />
        <Route path={ROUTES.TEACHER_FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.TEACHER_RESET_PASSWORD} element={<ResetPasswordPage />} />

        {/* Secure Classroom - Standalone Route */}
        <Route
          path="/classroom/:id"
          element={
            <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
              <LiveClassroomPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Student Dashboard */}
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentHomePage />} />
          <Route path="courses" element={<StudentCoursesPage />} />
          <Route path="courses/:id" element={<StudentCourseDetailPage />} />
          <Route path="courses/:id/lecture/:lectureId" element={<LecturePlayerPage />} />
          <Route path="packages" element={<StudentPackagesPage />} />
          <Route path="schedule" element={<StudentSchedulePage />} />
          <Route path="quizzes" element={<StudentQuizzesPage />} />
          <Route path="quizzes/:id" element={<StudentQuizzesPage />} />
          <Route path="profile" element={<StudentProfilePage />} />
          <Route path="parent-requests" element={<StudentParentRequestsPage />} />
        </Route>

        {/* Protected Parent Dashboard */}
        <Route
          path="/parent"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <ParentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ParentHomePage />} />
          <Route path="children" element={<ParentChildrenPage />} />
          <Route path="children/:childId/store" element={<ParentStorePage />} />
          <Route path="children/:childId/courses/:courseId/progress" element={<ParentCourseProgressPage />} />
          <Route path="settings" element={<ParentSettingsPage />} />
        </Route>

        {/* Protected Teacher Dashboard */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<TeacherDashboardPage />} />
          <Route path="courses" element={<TeacherCoursesPage />} />
          <Route path="courses/:id" element={<TeacherCourseDetailsPage />} />
          <Route path="quizzes" element={<TeacherQuizzesPage />} />
          <Route path="analytics" element={<TeacherAnalyticsPage />} />
          <Route path="settings" element={<TeacherSettingsPage />} />
          <Route path="slot-requests" element={<TeacherSlotRequestsPage />} />
          <Route path="weekly-schedule" element={<TeacherWeeklySchedulePage />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="admins" element={<AdminAdminsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="users/students/:id" element={<AdminStudentDetailsPage />} />
          <Route path="users/parents/:id" element={<AdminParentDetailsPage />} />
          <Route path="grades" element={<AdminGradesPage />} />
          <Route path="courses" element={<AdminCoursesPage />} />
          <Route path="courses/:courseId/units" element={<AdminCourseUnitsPage />} />
          <Route path="lectures" element={<AdminLecturesPage />} />
          <Route path="teachers" element={<AdminTeachersPage />} />
          <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
          <Route path="semesters" element={<AdminSemestersPage />} />
          <Route path="subjects" element={<AdminSubjectsPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="packages" element={<AdminPackagesPage />} />
          <Route path="package-subscriptions" element={<AdminPackageSubscriptionsPage />} />
          <Route path="academic-structure" element={<AdminAcademicGraphPage />} />
          <Route path="client-reports" element={<AdminClientReportsPage />} />
          <Route path="content-approvals" element={<AdminContentApprovalsPage />} />
          <Route path="quizzes" element={<AdminQuizzesPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="schedule-config" element={<AdminScheduleConfigPage />} />
          <Route path="slot-requests" element={<AdminSlotRequestsPage />} />
          <Route path="class-schedules" element={<AdminClassSchedulesPage />} />
        </Route>

        {/* 404 Catch-all Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

// ─────────────────────────────────────────────────────────────
// App — Code-split route tree
//
// NOTE: QueryClientProvider lives in main.tsx. Do NOT add a
// second one here — duplicate providers cause separate caches
// and double-fetching.
// ─────────────────────────────────────────────────────────────
function App() {
  return (
    <SmoothScrollWrapper>
      <ThemeProvider>
        <BrowserRouter>
          <SessionEnforcer />
          <ScrollToTop />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 5000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          <MaintenanceWrapper>
            <AppRoutes />
          </MaintenanceWrapper>
        </BrowserRouter>
      </ThemeProvider>
    </SmoothScrollWrapper>
  );
}

export default App;
