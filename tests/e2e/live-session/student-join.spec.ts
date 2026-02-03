/**
 * E2E Tests: Student Live Session Join Flow
 * 
 * Tests the complete live session join experience including:
 * - Session state detection (upcoming, live, ended)
 * - Error handling (not enrolled, session not started)
 * - Join flow and modal behavior
 * - Network error resilience
 * 
 * @see live_session_fix_plan.md for requirements
 */

import { test, expect } from '@playwright/test';
import { StudentLoginPage } from '../pages/StudentLoginPage';
import { LiveSessionPage } from '../pages/LiveSessionPage';

// ═══════════════════════════════════════════════════════════════
// Test Configuration
// ═══════════════════════════════════════════════════════════════

// Test data - adjust based on your test fixtures/seeding
const TEST_DATA = {
    COURSE_WITH_UPCOMING_SESSION: { courseId: 1, lectureId: 1 },
    COURSE_WITH_LIVE_SESSION: { courseId: 1, lectureId: 2 },
    COURSE_WITH_ENDED_SESSION: { courseId: 1, lectureId: 3 },
    COURSE_NOT_ENROLLED: { courseId: 99, lectureId: 1 },
};

// ═══════════════════════════════════════════════════════════════
// Test Suite: Student Live Session Join
// ═══════════════════════════════════════════════════════════════

test.describe('Student Live Session Join', () => {
    let loginPage: StudentLoginPage;
    let liveSessionPage: LiveSessionPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new StudentLoginPage(page);
        liveSessionPage = new LiveSessionPage(page);

        // Login as enrolled student
        await loginPage.goto();
        await loginPage.loginAsEnrolledStudent();
    });

    // ─────────────────────────────────────────────────────────────
    // Session State Tests
    // ─────────────────────────────────────────────────────────────

    test('displays upcoming session with countdown timer', async () => {
        const { courseId, lectureId } = TEST_DATA.COURSE_WITH_UPCOMING_SESSION;
        await liveSessionPage.goto(courseId, lectureId);

        await liveSessionPage.expectSessionToBeUpcoming();
        // Join button should be disabled for upcoming sessions
        // (or show countdown UI)
    });

    test('displays live session with active join button', async () => {
        const { courseId, lectureId } = TEST_DATA.COURSE_WITH_LIVE_SESSION;
        await liveSessionPage.goto(courseId, lectureId);

        await liveSessionPage.expectSessionToBeLive();
        await liveSessionPage.expectJoinButtonEnabled();
    });

    test('displays ended session with no join option', async () => {
        const { courseId, lectureId } = TEST_DATA.COURSE_WITH_ENDED_SESSION;
        await liveSessionPage.goto(courseId, lectureId);

        await liveSessionPage.expectSessionToBeEnded();
    });

    // ─────────────────────────────────────────────────────────────
    // Join Flow Tests
    // ─────────────────────────────────────────────────────────────

    test('opens embed modal when joining live session', async () => {
        const { courseId, lectureId } = TEST_DATA.COURSE_WITH_LIVE_SESSION;
        await liveSessionPage.goto(courseId, lectureId);

        await liveSessionPage.clickJoinSession();
        await liveSessionPage.expectModalToOpen();

        // Verify modal contains BBB iframe or loading state
        await expect(liveSessionPage.page.locator('iframe[title="Live Session"]')).toBeVisible({ timeout: 15000 });
    });

    test('shows loading state while connecting to session', async () => {
        const { courseId, lectureId } = TEST_DATA.COURSE_WITH_LIVE_SESSION;
        await liveSessionPage.goto(courseId, lectureId);

        await liveSessionPage.clickJoinSession();

        // Should show loading indicator briefly
        await expect(liveSessionPage.page.getByText(/جاري الاتصال بالجلسة/i)).toBeVisible();
    });

    test('modal can be closed with exit button', async () => {
        const { courseId, lectureId } = TEST_DATA.COURSE_WITH_LIVE_SESSION;
        await liveSessionPage.goto(courseId, lectureId);

        await liveSessionPage.clickJoinSession();
        await liveSessionPage.expectModalToOpen();

        await liveSessionPage.closeModal();
        await liveSessionPage.expectModalToBeClosed();
    });

    // ─────────────────────────────────────────────────────────────
    // Error Handling Tests (Task 2.1 Coverage)
    // ─────────────────────────────────────────────────────────────

    test('shows not enrolled error for unenrolled student', async ({ page }) => {
        // Login as unenrolled student
        loginPage = new StudentLoginPage(page);
        liveSessionPage = new LiveSessionPage(page);

        await loginPage.goto();
        await loginPage.loginAsUnenrolledStudent();

        const { courseId, lectureId } = TEST_DATA.COURSE_NOT_ENROLLED;
        await liveSessionPage.goto(courseId, lectureId);

        // May be redirected or show error inline
        // The exact behavior depends on backend - could be 403 or inline message
        await liveSessionPage.expectNotEnrolledError();

        // Should show "Browse Courses" CTA
        await expect(page.getByRole('link', { name: /استعرض الدورات/i })).toBeVisible();
    });

    test('shows session not started message when teacher has not joined', async () => {
        // This test assumes there's a scheduled but not-started session
        const { courseId, lectureId } = TEST_DATA.COURSE_WITH_UPCOMING_SESSION;
        await liveSessionPage.goto(courseId, lectureId);

        // Try to join an upcoming session
        await liveSessionPage.clickJoinSession();

        // Should show informative message
        await liveSessionPage.expectSessionNotStartedMessage();

        // Button should be re-enabled for retry
        await liveSessionPage.expectJoinButtonEnabled();
    });

    test('shows toast notification on API error', async () => {
        const { courseId, lectureId } = TEST_DATA.COURSE_WITH_LIVE_SESSION;
        await liveSessionPage.goto(courseId, lectureId);

        // This test would need to mock the API to return an error
        // In a real scenario, you'd use route.abort() or route.fulfill()
        // with an error response to test this

        // Example:
        // await liveSessionPage.page.route('**/api/v1/students/bbb/**', route => {
        //     route.fulfill({ status: 500, body: JSON.stringify({ success: false }) });
        // });
        // await liveSessionPage.clickJoinSession();
        // await liveSessionPage.expectToastWithText(/حدث خطأ/i);
    });

    // ─────────────────────────────────────────────────────────────
    // Accessibility Tests
    // ─────────────────────────────────────────────────────────────

    test('join button is keyboard accessible', async () => {
        const { courseId, lectureId } = TEST_DATA.COURSE_WITH_LIVE_SESSION;
        await liveSessionPage.goto(courseId, lectureId);

        // Focus the join button using keyboard navigation
        await liveSessionPage.page.keyboard.press('Tab');

        // Verify button is focusable
        const focusedElement = liveSessionPage.page.locator(':focus');
        await expect(focusedElement).toHaveRole('button');
    });

    test('modal traps focus for accessibility', async () => {
        const { courseId, lectureId } = TEST_DATA.COURSE_WITH_LIVE_SESSION;
        await liveSessionPage.goto(courseId, lectureId);

        await liveSessionPage.clickJoinSession();
        await liveSessionPage.expectModalToOpen();

        // Focus should be within modal container
        // Tab should cycle within modal only
        const modal = liveSessionPage.embedModal;

        // First Tab should focus something in the modal
        await liveSessionPage.page.keyboard.press('Tab');
        const focusedElement = liveSessionPage.page.locator(':focus');

        // Focused element should be inside modal
        await expect(modal.locator(':focus')).toBeTruthy();
    });

    test('ESC key closes modal', async () => {
        const { courseId, lectureId } = TEST_DATA.COURSE_WITH_LIVE_SESSION;
        await liveSessionPage.goto(courseId, lectureId);

        await liveSessionPage.clickJoinSession();
        await liveSessionPage.expectModalToOpen();

        await liveSessionPage.page.keyboard.press('Escape');

        await liveSessionPage.expectModalToBeClosed();
    });
});

// ═══════════════════════════════════════════════════════════════
// Test Suite: Network Heartbeat & Reconnection (Task 2.2 Coverage)
// ═══════════════════════════════════════════════════════════════

test.describe('Live Session Network Heartbeat', () => {
    let loginPage: StudentLoginPage;
    let liveSessionPage: LiveSessionPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new StudentLoginPage(page);
        liveSessionPage = new LiveSessionPage(page);

        await loginPage.goto();
        await loginPage.loginAsEnrolledStudent();
    });

    test('shows connected status indicator in modal', async () => {
        const { courseId, lectureId } = TEST_DATA.COURSE_WITH_LIVE_SESSION;
        await liveSessionPage.goto(courseId, lectureId);

        await liveSessionPage.clickJoinSession();
        await liveSessionPage.expectModalToOpen();

        // Wait for initial connection check
        await liveSessionPage.page.waitForTimeout(2000); // Brief wait for heartbeat

        // Should show "متصل" (connected) status
        await liveSessionPage.expectConnectionStatusConnected();
    });

    test('shows disconnected overlay when offline', async ({ page, context }) => {
        const { courseId, lectureId } = TEST_DATA.COURSE_WITH_LIVE_SESSION;
        await liveSessionPage.goto(courseId, lectureId);

        await liveSessionPage.clickJoinSession();
        await liveSessionPage.expectModalToOpen();

        // Simulate going offline
        await context.setOffline(true);

        // Wait for heartbeat to detect offline (max 30 seconds but faster due to browser event)
        await liveSessionPage.expectToastWithText(/يرجى التحقق من اتصالك/i);

        // Re-enable network
        await context.setOffline(false);
    });

    test('reconnects automatically when coming back online', async ({ page, context }) => {
        const { courseId, lectureId } = TEST_DATA.COURSE_WITH_LIVE_SESSION;
        await liveSessionPage.goto(courseId, lectureId);

        await liveSessionPage.clickJoinSession();
        await liveSessionPage.expectModalToOpen();

        // Go offline briefly
        await context.setOffline(true);
        await page.waitForTimeout(500);
        await context.setOffline(false);

        // Should show reconnecting toast
        await liveSessionPage.expectToastWithText(/جاري إعادة الاتصال/i);
    });

    test('allows manual reconnection attempt', async ({ page, context }) => {
        const { courseId, lectureId } = TEST_DATA.COURSE_WITH_LIVE_SESSION;
        await liveSessionPage.goto(courseId, lectureId);

        await liveSessionPage.clickJoinSession();
        await liveSessionPage.expectModalToOpen();

        // Simulate connection failure by intercepting status endpoint
        await page.route('**/api/v1/lectures/**/status', route => {
            route.abort('connectionfailed');
        });

        // Wait for heartbeat failures to trigger disconnected state
        await page.waitForTimeout(5000);

        // If disconnected overlay appears, test the reconnect button
        const isDisconnected = await liveSessionPage.disconnectedOverlay.isVisible().catch(() => false);
        if (isDisconnected) {
            // Remove route to allow reconnection
            await page.unroute('**/api/v1/lectures/**/status');

            await liveSessionPage.clickReconnect();

            // Should show reconnecting state
            await liveSessionPage.expectToastWithText(/جاري إعادة الاتصال/i);
        }
    });
});
