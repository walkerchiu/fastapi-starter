import { Page, Locator } from '@playwright/test';

export interface UserInfo {
  name: string;
  email: string;
  role: string;
}

export class DashboardPage {
  readonly page: Page;
  readonly welcomeMessage: Locator;
  readonly userNameDisplay: Locator;
  readonly userEmailDisplay: Locator;
  readonly userRoleDisplay: Locator;
  readonly apiModeToggle: Locator;
  readonly restApiOption: Locator;
  readonly graphqlOption: Locator;
  readonly statCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.welcomeMessage = page.getByRole('heading', { name: /welcome|歡迎/i });
    this.userNameDisplay = page.getByTestId('user-name');
    this.userEmailDisplay = page.getByTestId('user-email');
    this.userRoleDisplay = page.getByTestId('user-role');
    this.apiModeToggle = page.getByTestId('api-mode-toggle');
    this.restApiOption = page.getByRole('option', { name: /rest/i });
    this.graphqlOption = page.getByRole('option', { name: /graphql/i });
    this.statCards = page.getByTestId('stat-card');
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  async getUserInfo(): Promise<UserInfo> {
    return {
      name: (await this.userNameDisplay.textContent()) || '',
      email: (await this.userEmailDisplay.textContent()) || '',
      role: (await this.userRoleDisplay.textContent()) || '',
    };
  }

  async switchApiMode(mode: 'rest' | 'graphql') {
    await this.apiModeToggle.click();
    if (mode === 'rest') {
      await this.restApiOption.click();
    } else {
      await this.graphqlOption.click();
    }
  }

  async getStatCardsCount() {
    return this.statCards.count();
  }

  async isWelcomeMessageVisible() {
    return this.welcomeMessage.isVisible();
  }
}
