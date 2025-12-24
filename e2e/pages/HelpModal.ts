import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * HelpModal - ヘルプモーダル
 */
export class HelpModal extends BasePage {
  readonly modal: Locator;
  readonly versionInfo: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.modal = page.locator('div').filter({ hasText: /ヘルプ/ }).first();
    // バージョン情報は "X.X.X-dev" または "Build: X.X.X-YYYYMMDD-NNN" 形式
    this.versionInfo = page.locator('span.font-mono').filter({ hasText: /-dev|Build:/ });
    this.closeButton = page.locator('button').filter({ has: page.locator('svg.lucide-chevron-down') });
  }

  async waitForOpen(): Promise<void> {
    await this.versionInfo.waitFor({ state: 'visible', timeout: 10000 });
  }

  async getVersionInfo(): Promise<string> {
    return await this.versionInfo.textContent() || '';
  }

  async expectVersionInfoVisible(): Promise<void> {
    await expect(this.versionInfo).toBeVisible();
  }

  async expectVersionInfoContains(pattern: RegExp): Promise<void> {
    await expect(this.versionInfo).toHaveText(pattern);
  }
}
