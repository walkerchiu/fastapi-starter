import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { RegisterPage } from '../pages/register.page';
import { DashboardPage } from '../pages/dashboard.page';
import { ProfilePage } from '../pages/profile.page';
import { TwoFactorPage } from '../pages/two-factor.page';
import { NavigationComponent } from '../components/navigation.component';
import { TEST_USERS } from '../utils/test-data';

type Fixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  dashboardPage: DashboardPage;
  profilePage: ProfilePage;
  twoFactorPage: TwoFactorPage;
  navigation: NavigationComponent;
  authenticatedPage: Page;
  adminPage: Page;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  profilePage: async ({ page }, use) => {
    await use(new ProfilePage(page));
  },

  twoFactorPage: async ({ page }, use) => {
    await use(new TwoFactorPage(page));
  },

  navigation: async ({ page }, use) => {
    await use(new NavigationComponent(page));
  },

  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(TEST_USERS.user.email, TEST_USERS.user.password);
    await page.waitForURL('/dashboard');
    await use(page);
  },

  adminPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
    await page.waitForURL('/dashboard');
    await use(page);
  },
});

export { expect } from '@playwright/test';
