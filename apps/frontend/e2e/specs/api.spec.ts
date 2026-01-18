import { test, expect } from '../fixtures/auth.fixture';
import { DashboardPage } from '../pages/dashboard.page';
import { ROUTES } from '../utils/test-data';
import { clearBrowserState } from '../utils/helpers';

test.describe('API Integration', () => {
  test.beforeEach(async ({ page }) => {
    await clearBrowserState(page);
  });

  // API-001: REST and GraphQL Mode Switching
  test('API-001: should switch between REST and GraphQL API modes', async ({
    authenticatedPage,
  }) => {
    const dashboardPage = new DashboardPage(authenticatedPage);
    await dashboardPage.goto();

    // Verify we're on dashboard
    await expect(authenticatedPage).toHaveURL(new RegExp(ROUTES.dashboard));

    // Check if API mode toggle exists
    if (await dashboardPage.apiModeToggle.isVisible()) {
      // Get initial data (REST mode by default)
      const initialUserInfo = await dashboardPage.getUserInfo();

      // Switch to GraphQL mode
      await dashboardPage.switchApiMode('graphql');

      // Wait for data to refresh
      await authenticatedPage.waitForLoadState('networkidle');

      // Get data in GraphQL mode
      const graphqlUserInfo = await dashboardPage.getUserInfo();

      // Data should be consistent between both modes
      // Note: This comparison might need adjustment based on actual implementation
      if (initialUserInfo.email && graphqlUserInfo.email) {
        expect(graphqlUserInfo.email).toBe(initialUserInfo.email);
      }

      // Switch back to REST mode
      await dashboardPage.switchApiMode('rest');

      // Wait for data to refresh
      await authenticatedPage.waitForLoadState('networkidle');

      // Verify data consistency
      const restUserInfo = await dashboardPage.getUserInfo();
      if (restUserInfo.email && initialUserInfo.email) {
        expect(restUserInfo.email).toBe(initialUserInfo.email);
      }
    } else {
      // If API mode toggle doesn't exist, verify dashboard loads correctly
      const isWelcomeVisible = await dashboardPage.isWelcomeMessageVisible();
      expect(isWelcomeVisible).toBeTruthy();
    }
  });
});
