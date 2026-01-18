import { test, expect } from '../fixtures/auth.fixture';
import { LoginPage } from '../pages/login.page';
import { RegisterPage } from '../pages/register.page';
import { clearBrowserState, mockNetworkError } from '../utils/helpers';

test.describe('Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await clearBrowserState(page);
  });

  // ERR-001: Network Error Handling
  test('ERR-001: should display error message on network failure', async ({
    page,
  }) => {
    // Mock network error for auth API
    await mockNetworkError(page, '**/api/auth/**');
    await mockNetworkError(page, '**/graphql');

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('test@example.com', 'Password123!@#');

    // Should show error message
    const errorVisible = await page
      .getByRole('alert')
      .or(page.getByText(/error|錯誤|failed|失敗|network|網路/i))
      .first()
      .isVisible({ timeout: 10000 })
      .catch(() => false);

    expect(errorVisible).toBeTruthy();
  });

  // ERR-002: Form Validation Errors
  test('ERR-002: should display validation errors for empty form', async ({
    page,
  }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();

    // Submit empty form
    await registerPage.submit();

    // Should show validation errors
    const hasValidationError = await page
      .getByText(/required|必填|invalid|無效|please enter|請輸入/)
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    // Or check for field-level error indicators
    const hasFieldError = await page
      .locator('[aria-invalid="true"]')
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    expect(hasValidationError || hasFieldError).toBeTruthy();

    // Verify form is still available
    await expect(registerPage.emailInput).toBeVisible();
  });

  // ERR-003: 404 Page
  test('ERR-003: should display 404 page for non-existent routes', async ({
    page,
  }) => {
    // Navigate to a non-existent page
    await page.goto('/this-page-does-not-exist-12345');

    // Should show 404 content
    const has404Content = await page
      .getByText(/404|not found|找不到|頁面不存在/)
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    expect(has404Content).toBeTruthy();

    // Should have a way to go back to home
    const hasHomeLink = await page
      .getByRole('link', { name: /home|首頁|back|返回/i })
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    // Or check for any navigation option
    const hasNavigation = await page
      .getByRole('navigation')
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    expect(hasHomeLink || hasNavigation).toBeTruthy();
  });
});
