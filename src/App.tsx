import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  LandingPage,
  SignInPage,
  SignupPage,
  VerifyEmailPage,
  ForgotPasswordPage,
  ResetPasswordPage,

  AdminLoginPage,
  AdminDashboard,
  AdminAdminsPage,
  AdminUsersPage,
  AdminGradesPage,
  AdminCoursesPage,
  AdminTeachersPage,
  AdminSubscriptionsPage,
  AdminReportsPage,
  AdminSettingsPage,
  AdminPaymentsPage,
  AdminSemestersPage,
  AdminSubjectsPage,
  AdminLecturesPage,
  StudentLayout,
  StudentHomePage,
  StudentCoursesPage,
  StudentCourseDetailPage,
  StudentSchedulePage,
  StudentQuizzesPage,
  StudentLivePage,
  StudentProfilePage,
  ParentLayout,
  ParentHomePage,
  ParentChildrenPage,
  ParentFinancePage,
  ParentSettingsPage
} from './presentation/pages';
import { AdminLayout } from './presentation/components/admin';
import { ProtectedRoute } from './presentation/components/auth';
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path={ROUTES.HOME} element={<LandingPage />} />
          <Route path={ROUTES.LOGIN} element={<SignInPage />} />
          <Route path={ROUTES.REGISTER} element={<SignupPage />} />
          <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
          <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLoginPage />} />

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
            <Route path="schedule" element={<StudentSchedulePage />} />
            <Route path="quizzes" element={<StudentQuizzesPage />} />
            <Route path="live" element={<StudentLivePage />} />
            <Route path="profile" element={<StudentProfilePage />} />
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
            <Route path="lectures" element={<AdminLecturesPage />} />
            <Route path="teachers" element={<AdminTeachersPage />} />
            <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
            <Route path="payments" element={<AdminPaymentsPage />} />
            <Route path="semesters" element={<AdminSemestersPage />} />
            <Route path="subjects" element={<AdminSubjectsPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
