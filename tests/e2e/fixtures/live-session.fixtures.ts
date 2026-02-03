/**
 * Test Fixtures for Live Session E2E Tests
 * 
 * Provides reusable fixtures for authentication and page object setup.
 * Extend Playwright's base test with custom fixtures for consistency.
 */

import { test as base, expect } from '@playwright/test';
import { StudentLoginPage } from '../pages/StudentLoginPage';
import { LiveSessionPage } from '../pages/LiveSessionPage';

// ═══════════════════════════════════════════════════════════════
// Custom Fixtures Type
// ═══════════════════════════════════════════════════════════════

interface LiveSessionFixtures {
    studentLoginPage: StudentLoginPage;
    liveSessionPage: LiveSessionPage;
    authenticatedPage: void;
}

// ═══════════════════════════════════════════════════════════════
// Extended Test with Fixtures
// ═══════════════════════════════════════════════════════════════

export const test = base.extend<LiveSessionFixtures>({
    // Page Object fixtures
    studentLoginPage: async ({ page }, use) => {
        await use(new StudentLoginPage(page));
    },

    liveSessionPage: async ({ page }, use) => {
        await use(new LiveSessionPage(page));
    },

    // Pre-authenticated fixture
    authenticatedPage: async ({ page, studentLoginPage }, use) => {
        await studentLoginPage.goto();
        await studentLoginPage.loginAsEnrolledStudent();
        await use();
    },
});

export { expect };

// ═══════════════════════════════════════════════════════════════
// Test Helpers
// ═══════════════════════════════════════════════════════════════

/**
 * Mock API Response Helper
 * 
 * Use this to mock specific API responses for testing error scenarios.
 */
export async function mockApiResponse(
    page: import('@playwright/test').Page,
    urlPattern: string,
    response: { status: number; body: object }
) {
    await page.route(urlPattern, route => {
        route.fulfill({
            status: response.status,
            contentType: 'application/json',
            body: JSON.stringify(response.body),
        });
    });
}

/**
 * Mock Network Failure Helper
 */
export async function mockNetworkFailure(
    page: import('@playwright/test').Page,
    urlPattern: string
) {
    await page.route(urlPattern, route => {
        route.abort('connectionfailed');
    });
}

/**
 * Clear All Mocks Helper
 */
export async function clearMocks(page: import('@playwright/test').Page) {
    await page.unroute('**/*');
}
