import { Page } from '@playwright/test';

/**
 * BasePage - 全ページ共通の機能を提供
 */
export class BasePage {
  constructor(protected readonly page: Page) {}

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }
}
