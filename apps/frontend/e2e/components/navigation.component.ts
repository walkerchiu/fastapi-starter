import { Page, Locator } from '@playwright/test';

export class NavigationComponent {
  readonly page: Page;
  readonly navbar: Locator;
  readonly loginLink: Locator;
  readonly registerLink: Locator;
  readonly logoutButton: Locator;
  readonly dashboardLink: Locator;
  readonly profileLink: Locator;
  readonly languageSwitcher: Locator;
  readonly themeToggle: Locator;
  readonly userMenu: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navbar = page.getByRole('navigation');
    this.loginLink = page.getByRole('link', { name: /login|登入|sign in/i });
    this.registerLink = page.getByRole('link', {
      name: /register|註冊|sign up/i,
    });
    this.logoutButton = page.getByRole('button', {
      name: /logout|登出|sign out/i,
    });
    this.dashboardLink = page.getByRole('link', { name: /dashboard|儀表板/i });
    this.profileLink = page.getByRole('link', { name: /profile|個人資料/i });
    this.languageSwitcher = page.getByTestId('language-switcher');
    this.themeToggle = page.getByTestId('theme-toggle');
    this.userMenu = page.getByTestId('user-menu');
  }

  async clickLogin() {
    await this.loginLink.click();
  }

  async clickRegister() {
    await this.registerLink.click();
  }

  async clickLogout() {
    // Open user menu first if needed
    if (await this.userMenu.isVisible()) {
      await this.userMenu.click();
    }
    await this.logoutButton.click();
  }

  async clickDashboard() {
    await this.dashboardLink.click();
  }

  async clickProfile() {
    // Open user menu first if needed
    if (await this.userMenu.isVisible()) {
      await this.userMenu.click();
    }
    await this.profileLink.click();
  }

  async switchLanguage(language: 'en' | 'zh-TW') {
    await this.languageSwitcher.click();
    const languageOption = this.page.getByRole('option', {
      name: language === 'en' ? /english/i : /繁體中文/i,
    });
    await languageOption.click();
  }

  async toggleTheme() {
    await this.themeToggle.click();
  }

  async isLoginLinkVisible() {
    return this.loginLink.isVisible();
  }

  async isLogoutButtonVisible() {
    // Check if user menu exists first
    if (await this.userMenu.isVisible()) {
      await this.userMenu.click();
      const visible = await this.logoutButton.isVisible();
      await this.page.keyboard.press('Escape');
      return visible;
    }
    return this.logoutButton.isVisible();
  }

  async isDashboardLinkVisible() {
    return this.dashboardLink.isVisible();
  }

  async getCurrentLanguage(): Promise<string> {
    const html = this.page.locator('html');
    return (await html.getAttribute('lang')) || 'en';
  }

  async getCurrentTheme(): Promise<'light' | 'dark'> {
    const html = this.page.locator('html');
    const isDark = await html.evaluate((el) => el.classList.contains('dark'));
    return isDark ? 'dark' : 'light';
  }
}
