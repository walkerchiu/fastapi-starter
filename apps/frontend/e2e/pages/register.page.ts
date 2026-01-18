import { Page, Locator } from '@playwright/test';

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
}

export class RegisterPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;
  readonly loginLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByLabel('Name');
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password', { exact: true });
    this.confirmPasswordInput = page.getByLabel(/confirm password|確認密碼/i);
    this.submitButton = page.getByRole('button', {
      name: /register|註冊|sign up/i,
    });
    this.successMessage = page
      .getByRole('alert')
      .filter({ hasText: /success|成功/i });
    this.errorMessage = page
      .getByRole('alert')
      .filter({ hasText: /error|錯誤/i });
    this.loginLink = page.getByRole('link', { name: /login|登入|sign in/i });
  }

  async goto() {
    await this.page.goto('/register');
  }

  async fillForm(data: RegisterFormData) {
    if (data.name) {
      await this.nameInput.fill(data.name);
    }
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);
    await this.confirmPasswordInput.fill(data.confirmPassword);
  }

  async submit() {
    await this.submitButton.click();
  }

  async register(data: RegisterFormData) {
    await this.fillForm(data);
    await this.submit();
  }

  async getSuccessMessage() {
    return this.successMessage.textContent();
  }

  async getErrorMessage() {
    return this.errorMessage.textContent();
  }

  async isSuccessVisible() {
    return this.successMessage.isVisible();
  }

  async clickLogin() {
    await this.loginLink.click();
  }
}
