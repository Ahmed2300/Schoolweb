/**
 * Page Object Model: Live Session Page
 * 
 * Encapsulates live session page interactions including:
 * - Join button interactions
 * - Session status checking
 * - Modal handling
 * - Error state verification
 */

import { Page, Locator, expect } from '@playwright/test';

export class LiveSessionPage {
    readonly page: Page;

    // Session content area
    readonly sessionContainer: Locator;
    readonly joinButton: Locator;
    readonly joinButtonLive: Locator;

    // Status indicators
    readonly liveIndicator: Locator;
    readonly upcomingIndicator: Locator;
    readonly endedIndicator: Locator;
    readonly pendingIndicator: Locator;

    // Error states
    readonly notEnrolledError: Locator;
    readonly sessionNotStartedMessage: Locator;
    readonly sessionEndedMessage: Locator;

    // Modal elements
    readonly embedModal: Locator;
    readonly modalCloseButton: Locator;
    readonly connectionStatusIndicator: Locator;
    readonly disconnectedOverlay: Locator;
    readonly reconnectButton: Locator;

    // Toast messages
    readonly toastContainer: Locator;

    constructor(page: Page) {
        this.page = page;

        // Session content area - using text/role selectors
        this.sessionContainer = page.locator('.aspect-video');
        this.joinButton = page.getByRole('button', { name: /انضم للجلسة|join session/i });
        this.joinButtonLive = page.getByRole('button', { name: /انضم للجلسة المباشرة/i });

        // Status indicators - based on actual component text
        this.liveIndicator = page.getByText(/مباشر الآن|🔴 مباشر/i);
        this.upcomingIndicator = page.getByText(/جلسة مباشرة قادمة/i);
        this.endedIndicator = page.getByText(/انتهت الجلسة/i);
        this.pendingIndicator = page.getByText(/قيد الموافقة/i);

        // Error states - from the error state UI
        this.notEnrolledError = page.getByText(/غير مشترك في الدورة/i);
        this.sessionNotStartedMessage = page.getByText(/الجلسة لم تبدأ بعد/i);
        this.sessionEndedMessage = page.getByText(/انتهت الجلسة المباشرة/i);

        // Modal elements
        this.embedModal = page.locator('[style*="z-index: 99999"]');
        this.modalCloseButton = page.getByRole('button', { name: /خروج|close/i });
        this.connectionStatusIndicator = page.locator('.rounded-full').filter({ hasText: /متصل|جاري|غير متصل/ });
        this.disconnectedOverlay = page.getByText(/انقطع الاتصال/i);
        this.reconnectButton = page.getByRole('button', { name: /إعادة الاتصال/i });

        // Toast messages - react-hot-toast container
        this.toastContainer = page.locator('[role="status"]');
    }

    async goto(courseId: number, lectureId: number) {
        await this.page.goto(`/dashboard/courses/${courseId}/lecture/${lectureId}`);
    }

    async clickJoinSession() {
        // Try the main join button or the live-specific one
        const button = this.joinButton.or(this.joinButtonLive);
        await button.click();
    }

    async expectModalToOpen() {
        await expect(this.embedModal).toBeVisible({ timeout: 10000 });
    }

    async expectModalToBeClosed() {
        await expect(this.embedModal).not.toBeVisible();
    }

    async closeModal() {
        await this.modalCloseButton.click();
        await this.expectModalToBeClosed();
    }

    // ─────────────────────────────────────────────────────────────
    // Session State Assertions
    // ─────────────────────────────────────────────────────────────

    async expectSessionToBeUpcoming() {
        await expect(this.upcomingIndicator).toBeVisible();
    }

    async expectSessionToBeLive() {
        await expect(this.liveIndicator).toBeVisible();
    }

    async expectSessionToBeEnded() {
        await expect(this.endedIndicator).toBeVisible();
    }

    async expectSessionToBePending() {
        await expect(this.pendingIndicator).toBeVisible();
    }

    // ─────────────────────────────────────────────────────────────
    // Error State Assertions
    // ─────────────────────────────────────────────────────────────

    async expectNotEnrolledError() {
        await expect(this.notEnrolledError).toBeVisible();
    }

    async expectSessionNotStartedMessage() {
        await expect(this.sessionNotStartedMessage).toBeVisible();
    }

    async expectToastWithText(text: string | RegExp) {
        await expect(this.page.getByText(text)).toBeVisible({ timeout: 5000 });
    }

    // ─────────────────────────────────────────────────────────────
    // Connection State Assertions (within modal)
    // ─────────────────────────────────────────────────────────────

    async expectConnectionStatusConnected() {
        await expect(this.page.getByText(/متصل/i).first()).toBeVisible();
    }

    async expectDisconnectedOverlay() {
        await expect(this.disconnectedOverlay).toBeVisible();
    }

    async clickReconnect() {
        await this.reconnectButton.click();
    }

    // ─────────────────────────────────────────────────────────────
    // Button State Assertions
    // ─────────────────────────────────────────────────────────────

    async expectJoinButtonEnabled() {
        const button = this.joinButton.or(this.joinButtonLive);
        await expect(button.first()).toBeEnabled();
    }

    async expectJoinButtonDisabled() {
        const button = this.joinButton.or(this.joinButtonLive);
        await expect(button.first()).toBeDisabled();
    }

    async expectJoinButtonToShowLoading() {
        // Check for loading spinner in button
        await expect(this.page.locator('button .animate-spin')).toBeVisible();
    }
}
