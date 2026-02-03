/**
 * Page Object Model: Student Login Page
 * 
 * Encapsulates login page interactions for test reusability.
 * Following POM pattern per QA skill guidelines.
 */

import { Page, Locator, expect } from '@playwright/test';

export class StudentLoginPage {
    readonly page: Page;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly submitButton: Locator;
    readonly errorMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        // Using resilient selectors (role/name first, then test-id fallback)
        this.emailInput = page.getByRole('textbox', { name: /البريد الإلكتروني|email/i });
        this.passwordInput = page.getByLabel(/كلمة المرور|password/i);
        this.submitButton = page.getByRole('button', { name: /تسجيل الدخول|login|sign in/i });
        this.errorMessage = page.getByRole('alert');
    }

    async goto() {
        await this.page.goto('/login');
    }

    async login(email: string, password: string) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.submitButton.click();
    }

    async loginAsEnrolledStudent() {
        await this.login('enrolled-student@test.com', 'password');
        await this.page.waitForURL('**/dashboard**');
    }

    async loginAsUnenrolledStudent() {
        await this.login('unenrolled@test.com', 'password');
        await this.page.waitForURL('**/dashboard**');
    }

    async expectErrorMessage(message: string | RegExp) {
        await expect(this.errorMessage).toContainText(message);
    }
}
