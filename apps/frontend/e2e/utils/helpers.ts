import { Page, expect } from '@playwright/test';
import { ROUTES, TIMEOUTS } from './test-data';

/**
 * Wait for navigation to complete
 */
export async function waitForNavigation(
  page: Page,
  url: string,
): Promise<void> {
  await page.waitForURL(url, { timeout: TIMEOUTS.medium });
}

/**
 * Wait for page to be fully loaded
 */
export async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
}

/**
 * Check if user is on a specific page
 */
export async function assertCurrentPage(
  page: Page,
  expectedPath: string,
): Promise<void> {
  await expect(page).toHaveURL(new RegExp(expectedPath));
}

/**
 * Check if user is redirected to login page
 */
export async function assertRedirectedToLogin(page: Page): Promise<void> {
  await expect(page).toHaveURL(new RegExp(ROUTES.login));
}

/**
 * Check if user is redirected to unauthorized page
 */
export async function assertRedirectedToUnauthorized(
  page: Page,
): Promise<void> {
  await expect(page).toHaveURL(new RegExp(ROUTES.unauthorized));
}

/**
 * Clear all cookies and storage
 */
export async function clearBrowserState(page: Page): Promise<void> {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Set language preference
 */
export async function setLanguage(
  page: Page,
  language: 'en' | 'zh-TW',
): Promise<void> {
  await page.evaluate((lang) => {
    localStorage.setItem('language', lang);
  }, language);
}

/**
 * Set theme preference
 */
export async function setTheme(
  page: Page,
  theme: 'light' | 'dark',
): Promise<void> {
  await page.evaluate((t) => {
    localStorage.setItem('theme', t);
  }, theme);
}

/**
 * Get current theme from the page
 */
export async function getCurrentTheme(page: Page): Promise<'light' | 'dark'> {
  return page.evaluate(() => {
    return document.documentElement.classList.contains('dark')
      ? 'dark'
      : 'light';
  });
}

/**
 * Get current language from the page
 */
export async function getCurrentLanguage(page: Page): Promise<string> {
  return page.evaluate(() => {
    return document.documentElement.getAttribute('lang') || 'en';
  });
}

/**
 * Mock API response
 */
export async function mockApiResponse(
  page: Page,
  urlPattern: string,
  response: {
    status?: number;
    body?: unknown;
    headers?: Record<string, string>;
  },
): Promise<void> {
  await page.route(urlPattern, (route) => {
    route.fulfill({
      status: response.status || 200,
      contentType: 'application/json',
      body: JSON.stringify(response.body || {}),
      headers: response.headers,
    });
  });
}

/**
 * Mock network error
 */
export async function mockNetworkError(
  page: Page,
  urlPattern: string,
): Promise<void> {
  await page.route(urlPattern, (route) => {
    route.abort('failed');
  });
}

/**
 * Wait for toast message
 */
export async function waitForToast(
  page: Page,
  text: string | RegExp,
  _type: 'success' | 'error' | 'info' = 'success',
): Promise<void> {
  const toast = page.getByRole('alert').filter({ hasText: text });
  await expect(toast).toBeVisible({ timeout: TIMEOUTS.short });
}

/**
 * Take screenshot with descriptive name
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({
    path: `test-results/screenshots/${name}.png`,
    fullPage: true,
  });
}

/**
 * Generate TOTP code (mock for testing)
 * In real tests, you would use a library like otplib
 */
export function generateTOTPCode(_secret: string): string {
  // This is a mock implementation
  // In real tests, use: import { authenticator } from 'otplib';
  // return authenticator.generate(secret);
  return '123456';
}

/**
 * Wait for element to be stable (no animations)
 */
export async function waitForElementStable(
  page: Page,
  selector: string,
): Promise<void> {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible' });
  // Wait for any animations to complete
  await page.waitForTimeout(100);
}

/**
 * Scroll element into view
 */
export async function scrollIntoView(
  page: Page,
  selector: string,
): Promise<void> {
  const element = page.locator(selector);
  await element.scrollIntoViewIfNeeded();
}

/**
 * Check if element has specific class
 */
export async function hasClass(
  page: Page,
  selector: string,
  className: string,
): Promise<boolean> {
  const element = page.locator(selector);
  const classes = await element.getAttribute('class');
  return classes?.includes(className) || false;
}
