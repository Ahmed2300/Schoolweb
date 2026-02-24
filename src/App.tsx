import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ROUTES } from './shared/constants';
import { FullPageSkeleton } from './presentation/components/common/FullPageSkeleton';
import './shared/i18n';
import './index.css';

// ─────────────────────────────────────────────────────────────
// Non-lazy: lightweight wrappers & providers (tiny footprint)
// ─────────────────────────────────────────────────────────────
// Layouts are lazy-loaded so their specific dependencies (large Sidebars, charts) don't bloat the main bundle
const AdminLayout = lazy(() => import('./presentation/components/admin').then(m => ({ default: m.AdminLayout })));
const TeacherLayout = lazy(() => import('./presentation/components/teacher').then(m => ({ default: m.TeacherLayout })));

import { ProtectedRoute } from './presentation/components/auth';
import { MaintenanceWrapper } from './presentation/components/MaintenanceWrapper';
import { SmoothScrollWrapper } from './presentation/components/SmoothScrollWrapper';

import { ThemeProvider } from './context/ThemeContext';
import { useSessionEnforcement } from './hooks/useSessionEnforcement';
import 'lenis/dist/lenis.css';

// ─────────────────────────────────────────────────────────────
// React.lazy — Each page is a separate chunk loaded on demand.
// This is THE #1 performance improvement: visitors to /landing
// no longer download the Admin, Teacher, Student, or Parent code.
// ─────────────────────────────────────────────────────────────

// Public / Landing
const LandingPage = lazy(() => import('./presentation/pages/landing/LandingPage').then(m => ({ default: m.LandingPage })));
const FeaturesPage = lazy(() => import('./presentation/pages/landing/FeaturesPage').then(m => ({ default: m.FeaturesPage })));
const PrivacyPolicyPage = lazy(() => import('./presentation/pages/landing/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const TermsAndConditionsPage = lazy(() => import('./presentation/pages/landing/TermsAndConditionsPage').then(m => ({ default: m.TermsAndConditionsPage })));
const TechSupportPage = lazy(() => import('./presentation/pages/landing/TechSupportPage').then(m => ({ default: m.TechSupportPage })));
const ContactPage = lazy(() => import('./presentation/pages/ContactPage').then(m => ({ default: m.ContactPage })));
const NotFoundPage = lazy(() => import('./presentation/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Auth
const SignInPage = lazy(() => import('./presentation/pages/auth/SignInPage').then(m => ({ default: m.SignInPage })));
const SignupPage = lazy(() => import('./presentation/pages/auth/SignupPage').then(m => ({ default: m.SignupPage })));
const VerifyEmailPage = lazy(() => import('./presentation/pages/auth/VerifyEmailPage').then(m => ({ default: m.VerifyEmailPage })));
const ForgotPasswordPage = lazy(() => import('./presentation/pages/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./presentation/pages/auth/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const AdminLoginPage = lazy(() => import('./presentation/pages/auth/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const TeacherVerifyEmailPage = lazy(() => import('./presentation/pages/auth/TeacherVerifyEmailPage').then(m => ({ default: m.TeacherVerifyEmailPage })));

// Student Dashboard
const StudentLayout = lazy(() => import('./presentation/pages/dashboard/StudentLayout').then(m => ({ default: m.StudentLayout })));
const StudentHomePage = lazy(() => import('./presentation/pages/dashboard/StudentHomePage').then(m => ({ default: m.StudentHomePage })));
const StudentCoursesPage = lazy(() => import('./presentation/pages/dashboard/StudentCoursesPage').then(m => ({ default: m.StudentCoursesPage })));
const StudentCourseDetailPage = lazy(() => import('./presentation/pages/dashboard/StudentCourseDetailPage').then(m => ({ default: m.StudentCourseDetailPage })));
const StudentSchedulePage = lazy(() => import('./presentation/pages/dashboard/StudentSchedulePage').then(m => ({ default: m.StudentSchedulePage })));
const StudentQuizzesPage = lazy(() => import('./presentation/pages/dashboard/StudentQuizzesPage').then(m => ({ default: m.StudentQuizzesPage })));
const StudentLivePage = lazy(() => import('./presentation/pages/dashboard/StudentLivePage').then(m => ({ default: m.StudentLivePage })));
const StudentProfilePage = lazy(() => import('./presentation/pages/dashboard/StudentProfilePage').then(m => ({ default: m.StudentProfilePage })));
const StudentPackagesPage = lazy(() => import('./presentation/pages/dashboard/StudentPackagesPage').then(m => ({ default: m.StudentPackagesPage })));
const StudentParentRequestsPage = lazy(() => import('./presentation/pages/dashboard/StudentParentRequestsPage').then(m => ({ default: m.StudentParentRequestsPage })));
const LecturePlayerPage = lazy(() => import('./presentation/pages/student/LecturePlayerPage').then(m => ({ default: m.LecturePlayerPage })));

// Parent Dashboard
const ParentLayout = lazy(() => import('./presentation/pages/dashboard/ParentLayout').then(m => ({ default: m.ParentLayout })));
const ParentHomePage = lazy(() => import('./presentation/pages/dashboard/ParentHomePage').then(m => ({ default: m.ParentHomePage })));
const ParentChildrenPage = lazy(() => import('./presentation/pages/dashboard/ParentChildrenPage').then(m => ({ default: m.ParentChildrenPage })));
const ParentStorePage = lazy(() => import('./presentation/pages/dashboard/ParentStorePage').then(m => ({ default: m.ParentStorePage })));
const ParentSettingsPage = lazy(() => import('./presentation/pages/dashboard/ParentSettingsPage').then(m => ({ default: m.ParentSettingsPage })));
const ParentCourseProgressPage = lazy(() => import('./presentation/pages/dashboard/ParentCourseProgressPage').then(m => ({ default: m.ParentCourseProgressPage })));

// Teacher Dashboard
const TeacherDashboardPage = lazy(() => import('./presentation/pages/teacher/TeacherDashboardPage').then(m => ({ default: m.TeacherDashboardPage })));
const TeacherCoursesPage = lazy(() => import('./presentation/pages/teacher/TeacherCoursesPage').then(m => ({ default: m.TeacherCoursesPage })));
const TeacherCourseDetailsPage = lazy(() => import('./presentation/pages/teacher/TeacherCourseDetailsPage').then(m => ({ default: m.TeacherCourseDetailsPage })));
const TeacherQuizzesPage = lazy(() => import('./presentation/pages/teacher/TeacherQuizzesPage').then(m => ({ default: m.TeacherQuizzesPage })));
const TeacherSettingsPage = lazy(() => import('./presentation/pages/teacher/TeacherSettingsPage').then(m => ({ default: m.TeacherSettingsPage })));
const TeacherAnalyticsPage = lazy(() => import('./presentation/pages/teacher/AnalyticsPage').then(m => ({ default: m.TeacherAnalyticsPage })));
const TeacherSlotRequestsPage = lazy(() => import('./presentation/pages/teacher/TeacherSlotRequestsPage').then(m => ({ default: m.TeacherSlotRequestsPage })));
const TeacherWeeklySchedulePage = lazy(() => import('./presentation/pages/teacher/TeacherWeeklySchedulePage'));

// Admin Dashboard
const AdminDashboard = lazy(() => import('./presentation/pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminAdminsPage = lazy(() => import('./presentation/pages/admin/AdminAdminsPage').then(m => ({ default: m.AdminAdminsPage })));
const AdminUsersPage = lazy(() => import('./presentation/pages/admin/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })));
const AdminGradesPage = lazy(() => import('./presentation/pages/admin/AdminGradesPage').then(m => ({ default: m.AdminGradesPage })));
const AdminCoursesPage = lazy(() => import('./presentation/pages/admin/AdminCoursesPage').then(m => ({ default: m.AdminCoursesPage })));
const AdminCourseUnitsPage = lazy(() => import('./presentation/pages/admin/AdminCourseUnitsPage').then(m => ({ default: m.AdminCourseUnitsPage })));
const AdminTeachersPage = lazy(() => import('./presentation/pages/admin/AdminTeachersPage').then(m => ({ default: m.AdminTeachersPage })));
const AdminSubscriptionsPage = lazy(() => import('./presentation/pages/admin/AdminSubscriptionsPage').then(m => ({ default: m.AdminSubscriptionsPage })));
const AdminReportsPage = lazy(() => import('./presentation/pages/admin/AdminReportsPage').then(m => ({ default: m.AdminReportsPage })));
const AdminSettingsPage = lazy(() => import('./presentation/pages/admin/AdminSettingsPage').then(m => ({ default: m.AdminSettingsPage })));
const AdminPaymentsPage = lazy(() => import('./presentation/pages/admin/AdminPaymentsPage').then(m => ({ default: m.AdminPaymentsPage })));
const AdminSemestersPage = lazy(() => import('./presentation/pages/admin/AdminSemestersPage').then(m => ({ default: m.AdminSemestersPage })));
const AdminSubjectsPage = lazy(() => import('./presentation/pages/admin/AdminSubjectsPage').then(m => ({ default: m.AdminSubjectsPage })));
const AdminLecturesPage = lazy(() => import('./presentation/pages/admin/AdminLecturesPage').then(m => ({ default: m.AdminLecturesPage })));
const AdminPackagesPage = lazy(() => import('./presentation/pages/admin/packages/AdminPackagesPage').then(m => ({ default: m.AdminPackagesPage })));
const AdminPackageSubscriptionsPage = lazy(() => import('./presentation/pages/admin/AdminPackageSubscriptionsPage').then(m => ({ default: m.AdminPackageSubscriptionsPage })));
const AdminAcademicGraphPage = lazy(() => import('./presentation/pages/admin/AdminAcademicGraphPage'));
const AdminClientReportsPage = lazy(() => import('./presentation/pages/admin/AdminClientReportsPage').then(m => ({ default: m.AdminClientReportsPage })));
const AdminContentApprovalsPage = lazy(() => import('./presentation/pages/admin/approvals/AdminContentApprovalsPage').then(m => ({ default: m.AdminContentApprovalsPage })));
const AdminQuizzesPage = lazy(() => import('./presentation/pages/admin/quizzes/AdminQuizzesPage').then(m => ({ default: m.AdminQuizzesPage })));
const AdminScheduleConfigPage = lazy(() => import('./presentation/pages/admin/AdminScheduleConfigPage').then(m => ({ default: m.AdminScheduleConfigPage })));
const AdminSlotRequestsPage = lazy(() => import('./presentation/pages/admin/AdminSlotRequestsPage').then(m => ({ default: m.AdminSlotRequestsPage })));
const AdminClassSchedulesPage = lazy(() => import('./presentation/pages/admin/AdminClassSchedulesPage').then(m => ({ default: m.AdminClassSchedulesPage })));
const AdminStudentDetailsPage = lazy(() => import('./presentation/pages/admin/AdminStudentDetailsPage'));
const AdminParentDetailsPage = lazy(() => import('./presentation/pages/admin/AdminParentDetailsPage'));

// Classroom (standalone route)
const LiveClassroomPage = lazy(() => import('./presentation/pages/classroom/LiveClassroomPage'));

// ─────────────────────────────────────────────────────────────
// React Query Client
// ─────────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// ─────────────────────────────────────────────────────────────
// Session Enforcer (WebSocket force-logout listener)
// React Router's native startTransition keeps the old page
// visible until the new one is ready — no manual skeleton needed.
// ─────────────────────────────────────────────────────────────
function SessionEnforcer() {
  useSessionEnforcement();
  return null;
}

// ─────────────────────────────────────────────────────────────
// App — Code-split route tree wrapped in Suspense
// ─────────────────────────────────────────────────────────────
function App() {
  return (
    <SmoothScrollWrapper>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <BrowserRouter>
            <SessionEnforcer />
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
            </MaintenanceWrapper>
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </SmoothScrollWrapper>
  );
}

export default App;
