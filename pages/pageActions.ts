import { Page, Locator } from '@playwright/test';

export interface PageActions {
  navigateTo: (url: string) => Promise<void>;
  waitForVisible: (locator: Locator, timeout?: number) => Promise<void>;
}

export const createPageActions = (page: Page): PageActions => ({
  async navigateTo(url: string): Promise<void> {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
  },

  async waitForVisible(locator: Locator, timeout = 10000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }
});