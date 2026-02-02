import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import {
  LandingPage,
  PrivacyPolicyPage,
  SignInPage,
  SignupPage,
  VerifyEmailPage,
  ForgotPasswordPage,
  ResetPasswordPage,

  AdminLoginPage,
  TeacherVerifyEmailPage,
  AdminDashboard,
  AdminAdminsPage,
  AdminUsersPage,
  AdminGradesPage,
  AdminCoursesPage,
  AdminCourseUnitsPage,
  AdminTeachersPage,
  AdminSubscriptionsPage,
  AdminReportsPage,
  AdminSettingsPage,
  AdminPaymentsPage,
  AdminSemestersPage,
  AdminSubjectsPage,
  AdminLecturesPage,
  AdminPackagesPage,
  AdminPackageSubscriptionsPage,
  AdminAcademicGraphPage,
  AdminTimeSlotsPage,
  AdminContentApprovalsPage,
  AdminQuizzesPage,
  StudentLayout,
  StudentHomePage,
  StudentCoursesPage,
  StudentCourseDetailPage,
  StudentSchedulePage,
  StudentQuizzesPage,
  StudentLivePage,
  StudentProfilePage,
  StudentPackagesPage,
  StudentParentRequestsPage,
  ParentLayout,
  ParentHomePage,
  ParentChildrenPage,
  ParentFinancePage,
  ParentSettingsPage,
  TeacherDashboardPage,
  TeacherCoursesPage,
  TeacherCourseDetailsPage,
  TeacherQuizzesPage,
  TeacherSettingsPage,
  TeacherAnalyticsPage,
  TeacherTimeSlotsPage,
  TeacherRecordingsPage,
  NotFoundPage,
  LecturePlayerPage
} from './presentation/pages';
import { AdminLayout } from './presentation/components/admin';
import { TeacherLayout } from './presentation/components/teacher';
import { ProtectedRoute } from './presentation/components/auth';
import { MaintenanceWrapper } from './presentation/components/MaintenanceWrapper';
import { ROUTES } from './shared/constants';
import './shared/i18n';
import './index.css';


// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Classroom
import LiveClassroomPage from './presentation/pages/classroom/LiveClassroomPage';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
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
          <Routes>
            {/* Public routes */}
            <Route path={ROUTES.HOME} element={<LandingPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path={ROUTES.LOGIN} element={<SignInPage />} />
            <Route path={ROUTES.REGISTER} element={<SignupPage />} />
            <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
            <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
            <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
            <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLoginPage />} />
            <Route path={ROUTES.TEACHER_LOGIN} element={<AdminLoginPage />} />
            <Route path={ROUTES.TEACHER_VERIFY_EMAIL} element={<TeacherVerifyEmailPage />} />

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
              <Route path="live" element={<StudentLivePage />} />
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
              <Route path="finance" element={<ParentFinancePage />} />
              <Route path="settings" element={<ParentSettingsPage />} />
            </Route>

            {/* Protected Teacher Dashboard - Security: role-based access */}
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
              <Route path="time-slots" element={<TeacherTimeSlotsPage />} />
              <Route path="quizzes" element={<TeacherQuizzesPage />} />
              <Route path="time-slots" element={<TeacherTimeSlotsPage />} />
              <Route path="quizzes" element={<TeacherQuizzesPage />} />
              <Route path="analytics" element={<TeacherAnalyticsPage />} />
              <Route path="settings" element={<TeacherSettingsPage />} />
              <Route path="recordings" element={<TeacherRecordingsPage />} />
            </Route>

            {/* Admin Routes - Protected for admin role only */}
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
              <Route path="time-slots" element={<AdminTimeSlotsPage />} />
              <Route path="content-approvals" element={<AdminContentApprovalsPage />} />
              <Route path="quizzes" element={<AdminQuizzesPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            {/* 404 Catch-all Route */}
            <Route path="*" element={<NotFoundPage />} />

          </Routes>
        </MaintenanceWrapper>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
