import { Page, Locator } from '@playwright/test';

export interface ProfileUpdateData {
  name?: string;
  email?: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export class ProfilePage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly saveProfileButton: Locator;
  readonly currentPasswordInput: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly changePasswordButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;
  readonly twoFactorSetupLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByLabel('Name');
    this.emailInput = page.getByLabel('Email');
    this.saveProfileButton = page.getByRole('button', {
      name: /save|儲存|update profile/i,
    });
    this.currentPasswordInput = page.getByLabel(/current password|目前密碼/i);
    this.newPasswordInput = page.getByLabel(/new password|新密碼/i);
    this.confirmPasswordInput = page.getByLabel(
      /confirm.*password|確認.*密碼/i,
    );
    this.changePasswordButton = page.getByRole('button', {
      name: /change password|變更密碼/i,
    });
    this.successMessage = page
      .getByRole('alert')
      .filter({ hasText: /success|成功/i });
    this.errorMessage = page
      .getByRole('alert')
      .filter({ hasText: /error|錯誤/i });
    this.twoFactorSetupLink = page.getByRole('link', {
      name: /2fa|two-factor|雙因素/i,
    });
  }

  async goto() {
    await this.page.goto('/profile');
  }

  async updateProfile(data: ProfileUpdateData) {
    if (data.name) {
      await this.nameInput.clear();
      await this.nameInput.fill(data.name);
    }
    if (data.email) {
      await this.emailInput.clear();
      await this.emailInput.fill(data.email);
    }
    await this.saveProfileButton.click();
  }

  async changePassword(data: PasswordChangeData) {
    await this.currentPasswordInput.fill(data.currentPassword);
    await this.newPasswordInput.fill(data.newPassword);
    await this.confirmPasswordInput.fill(data.confirmPassword);
    await this.changePasswordButton.click();
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

  async clickTwoFactorSetup() {
    await this.twoFactorSetupLink.click();
  }

  async getProfileName() {
    return this.nameInput.inputValue();
  }

  async getProfileEmail() {
    return this.emailInput.inputValue();
  }
}
