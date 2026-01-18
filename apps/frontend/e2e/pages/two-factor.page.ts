import { Page, Locator } from '@playwright/test';

export class TwoFactorPage {
  readonly page: Page;
  readonly qrCode: Locator;
  readonly secretKey: Locator;
  readonly codeInput: Locator;
  readonly verifyButton: Locator;
  readonly enableButton: Locator;
  readonly disableButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;
  readonly backupCodes: Locator;

  constructor(page: Page) {
    this.page = page;
    this.qrCode = page.getByTestId('qr-code');
    this.secretKey = page.getByTestId('secret-key');
    this.codeInput = page.getByLabel(/code|驗證碼/i);
    this.verifyButton = page.getByRole('button', { name: /verify|驗證/i });
    this.enableButton = page.getByRole('button', { name: /enable|啟用/i });
    this.disableButton = page.getByRole('button', { name: /disable|停用/i });
    this.successMessage = page
      .getByRole('alert')
      .filter({ hasText: /success|成功/i });
    this.errorMessage = page
      .getByRole('alert')
      .filter({ hasText: /error|錯誤|invalid/i });
    this.backupCodes = page.getByTestId('backup-codes');
  }

  async goto() {
    await this.page.goto('/2fa/setup');
  }

  async gotoVerify() {
    await this.page.goto('/2fa/verify');
  }

  async getSecret(): Promise<string> {
    const secretText = await this.secretKey.textContent();
    return secretText || '';
  }

  async enterCode(code: string) {
    await this.codeInput.fill(code);
  }

  async verify() {
    await this.verifyButton.click();
  }

  async enable() {
    await this.enableButton.click();
  }

  async disable() {
    await this.disableButton.click();
  }

  async submitCode(code: string) {
    await this.enterCode(code);
    await this.verify();
  }

  async isQrCodeVisible() {
    return this.qrCode.isVisible();
  }

  async getSuccessMessage() {
    return this.successMessage.textContent();
  }

  async getErrorMessage() {
    return this.errorMessage.textContent();
  }

  async isErrorVisible() {
    return this.errorMessage.isVisible();
  }

  async getBackupCodes(): Promise<string[]> {
    const codesText = await this.backupCodes.textContent();
    return codesText ? codesText.split('\n').filter((code) => code.trim()) : [];
  }
}
