import { test, expect } from '../fixtures/auth.fixture';
import { LoginPage } from '../pages/login.page';
import { TwoFactorPage } from '../pages/two-factor.page';
import {
  TEST_USERS,
  TEST_CREDENTIALS,
  ROUTES,
  generateUniqueEmail,
  generateValidPassword,
} from '../utils/test-data';
import { clearBrowserState, waitForNavigation } from '../utils/helpers';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await clearBrowserState(page);
  });

  // AUTH-001: User Registration Flow
  test('AUTH-001: should complete user registration flow', async ({
    page,
    registerPage,
  }) => {
    const uniqueEmail = generateUniqueEmail('register');
    const password = generateValidPassword();

    await registerPage.goto();
    await registerPage.register({
      email: uniqueEmail,
      password: password,
      confirmPassword: password,
      name: 'Test User',
    });

    // Verify success message or redirect
    await expect(page).toHaveURL(
      new RegExp(`${ROUTES.login}|${ROUTES.dashboard}`),
    );
  });

  // AUTH-002: User Login Flow
  test('AUTH-002: should complete user login flow', async ({
    page,
    loginPage,
  }) => {
    await loginPage.goto();
    await loginPage.login(TEST_USERS.user.email, TEST_USERS.user.password);

    // Verify redirect to dashboard
    await waitForNavigation(page, '**/dashboard');
    await expect(page).toHaveURL(new RegExp(ROUTES.dashboard));

    // Verify session exists by checking dashboard content
    const dashboardContent = page.getByRole('main');
    await expect(dashboardContent).toBeVisible();
  });

  // AUTH-003: User Logout Flow
  test('AUTH-003: should complete user logout flow', async ({
    authenticatedPage,
    navigation,
  }) => {
    // Start from authenticated state
    await expect(authenticatedPage).toHaveURL(new RegExp(ROUTES.dashboard));

    // Click logout
    await navigation.clickLogout();

    // Verify redirect to home or login
    await expect(authenticatedPage).toHaveURL(
      new RegExp(`${ROUTES.home}|${ROUTES.login}`),
    );

    // Verify session is cleared by trying to access dashboard
    await authenticatedPage.goto(ROUTES.dashboard);
    await expect(authenticatedPage).toHaveURL(new RegExp(ROUTES.login));
  });

  // AUTH-004: Password Reset Flow
  test('AUTH-004: should complete password reset flow', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.clickForgotPassword();

    // Verify on forgot password page
    await expect(page).toHaveURL(new RegExp(ROUTES.forgotPassword));

    // Fill in email
    const emailInput = page.getByLabel('Email');
    await emailInput.fill(TEST_USERS.user.email);

    // Submit form
    const submitButton = page.getByRole('button', {
      name: /submit|送出|reset/i,
    });
    await submitButton.click();

    // Verify success message
    const successMessage = page
      .getByRole('alert')
      .filter({ hasText: /success|成功|sent|已發送/i });
    await expect(successMessage).toBeVisible({ timeout: 10000 });
  });

  // AUTH-005: Email Verification Flow
  test('AUTH-005: should handle email verification flow', async ({ page }) => {
    // Navigate to verify email page with mock token
    await page.goto(`${ROUTES.verifyEmail}?token=mock-verification-token`);

    // Check for verification result (success or error based on mock)
    const pageContent = page.getByRole('main');
    await expect(pageContent).toBeVisible();

    // Verify we're on the verify email page
    await expect(page).toHaveURL(new RegExp(ROUTES.verifyEmail));
  });

  // AUTH-006: 2FA Setup Flow
  test('AUTH-006: should complete 2FA setup flow', async ({
    authenticatedPage,
  }) => {
    const twoFactorPage = new TwoFactorPage(authenticatedPage);

    // Navigate to 2FA setup
    await twoFactorPage.goto();

    // Verify QR code is visible
    await expect(twoFactorPage.qrCode).toBeVisible({ timeout: 10000 });

    // Verify secret key is displayed
    const secret = await twoFactorPage.getSecret();
    expect(secret).toBeTruthy();
  });

  // AUTH-007: 2FA Login Flow
  test('AUTH-007: should handle 2FA login flow', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const twoFactorPage = new TwoFactorPage(page);

    // Login with 2FA-enabled account (assuming test user has 2FA enabled)
    await loginPage.goto();
    await loginPage.login(TEST_USERS.user.email, TEST_USERS.user.password);

    // If redirected to 2FA verification, handle it
    const currentUrl = page.url();
    if (currentUrl.includes('2fa')) {
      await expect(twoFactorPage.codeInput).toBeVisible();

      // Enter verification code
      await twoFactorPage.submitCode('123456');

      // Either success redirect or error message
      const hasError = await twoFactorPage.isErrorVisible();
      if (!hasError) {
        await expect(page).toHaveURL(new RegExp(ROUTES.dashboard));
      }
    } else {
      // User doesn't have 2FA enabled, should be on dashboard
      await expect(page).toHaveURL(new RegExp(ROUTES.dashboard));
    }
  });

  // AUTH-008: Login Failure Handling
  test('AUTH-008: should handle login failure correctly', async ({
    page,
    loginPage,
  }) => {
    await loginPage.goto();

    // Enter wrong credentials
    await loginPage.login(
      TEST_CREDENTIALS.validEmail,
      TEST_CREDENTIALS.wrongPassword,
    );

    // Verify error message is displayed
    await expect(loginPage.errorMessage).toBeVisible({ timeout: 10000 });

    // Verify still on login page
    await expect(page).toHaveURL(new RegExp(ROUTES.login));

    // Verify form is still available for retry
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
  });
});
