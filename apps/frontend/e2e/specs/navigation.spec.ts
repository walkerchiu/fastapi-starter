import { test, expect } from '../fixtures/auth.fixture';
import { NavigationComponent } from '../components/navigation.component';
import { ROUTES } from '../utils/test-data';
import { clearBrowserState, assertRedirectedToLogin } from '../utils/helpers';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await clearBrowserState(page);
  });

  // NAV-001: Unauthenticated User Navigation
  test('NAV-001: should show login/register links for unauthenticated users', async ({
    page,
    navigation,
  }) => {
    // Visit home page
    await page.goto(ROUTES.home);

    // Verify login and register links are visible
    await expect(navigation.loginLink).toBeVisible();
    await expect(navigation.registerLink).toBeVisible();

    // Try to access protected page
    await page.goto(ROUTES.dashboard);

    // Should be redirected to login
    await assertRedirectedToLogin(page);
  });

  // NAV-002: Authenticated User Navigation
  test('NAV-002: should show dashboard and profile links for authenticated users', async ({
    authenticatedPage,
  }) => {
    const navigation = new NavigationComponent(authenticatedPage);

    // Verify authenticated navigation elements
    await expect(navigation.dashboardLink).toBeVisible();

    // Verify logout is accessible
    const canLogout = await navigation.isLogoutButtonVisible();
    expect(canLogout).toBeTruthy();

    // Login link should not be visible
    await expect(navigation.loginLink).not.toBeVisible();
  });

  // NAV-003: Permission Denied Handling
  test('NAV-003: should redirect to unauthorized page when accessing admin routes', async ({
    authenticatedPage,
  }) => {
    // As a regular user, try to access admin-only route
    // This assumes there's an admin route that requires elevated permissions
    await authenticatedPage.goto('/admin');

    // Should be redirected to unauthorized page or show forbidden message
    const currentUrl = authenticatedPage.url();
    const isUnauthorized =
      currentUrl.includes('unauthorized') || currentUrl.includes('403');
    const isForbidden = await authenticatedPage
      .getByText(/forbidden|unauthorized|沒有權限/i)
      .isVisible()
      .catch(() => false);

    expect(isUnauthorized || isForbidden).toBeTruthy();
  });
});
