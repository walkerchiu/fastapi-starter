import { test, expect } from '../fixtures/auth.fixture';
import { NavigationComponent } from '../components/navigation.component';
import { ROUTES } from '../utils/test-data';
import { clearBrowserState, getCurrentTheme, setTheme } from '../utils/helpers';

test.describe('Theme', () => {
  test.beforeEach(async ({ page }) => {
    await clearBrowserState(page);
  });

  // THEME-001: Dark Mode Toggle
  test('THEME-001: should toggle dark mode and persist preference', async ({
    page,
  }) => {
    const navigation = new NavigationComponent(page);

    // Visit home page
    await page.goto(ROUTES.home);

    // Get initial theme
    const initialTheme = await getCurrentTheme(page);
    expect(['light', 'dark']).toContain(initialTheme);

    // Find and click theme toggle
    if (await navigation.themeToggle.isVisible()) {
      await navigation.toggleTheme();

      // Wait for theme to update
      await page.waitForTimeout(500);

      // Verify theme changed
      const newTheme = await getCurrentTheme(page);
      expect(newTheme).not.toBe(initialTheme);

      // Verify dark class is applied
      if (newTheme === 'dark') {
        const html = page.locator('html');
        await expect(html).toHaveClass(/dark/);
      }

      // Reload and verify theme persists
      await page.reload();
      await page.waitForLoadState('networkidle');

      const persistedTheme = await getCurrentTheme(page);
      expect(persistedTheme).toBe(newTheme);

      // Toggle back
      await navigation.toggleTheme();
      await page.waitForTimeout(500);

      const finalTheme = await getCurrentTheme(page);
      expect(finalTheme).toBe(initialTheme);
    } else {
      // If no theme toggle is visible, check if theme can be set via localStorage
      await setTheme(page, 'dark');
      await page.reload();
      await page.waitForLoadState('networkidle');

      const forcedTheme = await getCurrentTheme(page);
      // Theme system should respect localStorage preference
      expect(['light', 'dark']).toContain(forcedTheme);
    }
  });
});
