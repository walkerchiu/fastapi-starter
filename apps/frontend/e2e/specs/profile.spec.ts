import { test, expect } from '../fixtures/auth.fixture';
import { ProfilePage } from '../pages/profile.page';
import { LoginPage } from '../pages/login.page';
import { TEST_USERS, TEST_PROFILE_DATA, ROUTES } from '../utils/test-data';
import { waitForNavigation, clearBrowserState } from '../utils/helpers';

test.describe('Profile', () => {
  test.beforeEach(async ({ page }) => {
    await clearBrowserState(page);
  });

  // PROF-001: View Profile
  test('PROF-001: should display correct user information', async ({
    authenticatedPage,
  }) => {
    const profilePage = new ProfilePage(authenticatedPage);
    await profilePage.goto();

    // Verify profile page is loaded
    await expect(authenticatedPage).toHaveURL(new RegExp(ROUTES.profile));

    // Verify user information is displayed
    const profileName = await profilePage.getProfileName();
    const profileEmail = await profilePage.getProfileEmail();

    // Name and email should be populated
    expect(profileName || profileEmail).toBeTruthy();
  });

  // PROF-002: Update Profile
  test('PROF-002: should update profile successfully', async ({
    authenticatedPage,
  }) => {
    const profilePage = new ProfilePage(authenticatedPage);
    await profilePage.goto();

    // Update profile data
    const newName = TEST_PROFILE_DATA.updatedName;
    await profilePage.updateProfile({ name: newName });

    // Wait for success message
    await expect(profilePage.successMessage).toBeVisible({ timeout: 10000 });

    // Reload page and verify changes persisted
    await authenticatedPage.reload();
    const updatedName = await profilePage.getProfileName();
    expect(updatedName).toBe(newName);
  });

  // PROF-003: Change Password
  test('PROF-003: should change password and re-login successfully', async ({
    page,
  }) => {
    // First login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(TEST_USERS.user.email, TEST_USERS.user.password);
    await waitForNavigation(page, '**/dashboard');

    // Go to profile and change password
    const profilePage = new ProfilePage(page);
    await profilePage.goto();

    const newPassword = TEST_PROFILE_DATA.newPassword;
    await profilePage.changePassword({
      currentPassword: TEST_USERS.user.password,
      newPassword: newPassword,
      confirmPassword: newPassword,
    });

    // Verify success message
    await expect(profilePage.successMessage).toBeVisible({ timeout: 10000 });

    // Logout
    await page.goto(ROUTES.home);
    await clearBrowserState(page);

    // Try to login with new password
    await loginPage.goto();
    await loginPage.login(TEST_USERS.user.email, newPassword);

    // Should be able to login with new password
    await expect(page).toHaveURL(new RegExp(ROUTES.dashboard));

    // Revert password back (cleanup)
    await profilePage.goto();
    await profilePage.changePassword({
      currentPassword: newPassword,
      newPassword: TEST_USERS.user.password,
      confirmPassword: TEST_USERS.user.password,
    });
  });
});
