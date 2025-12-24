import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * TopPage - ファイルアップロード画面（トップページ）
 */
export class TopPage extends BasePage {
  readonly demoButton: Locator;
  readonly menuToggle: Locator;
  readonly helpButton: Locator;
  readonly fileUploadArea: Locator;

  constructor(page: Page) {
    super(page);
    this.demoButton = page.getByRole('button', { name: /デモを試す/i });
    this.menuToggle = page.locator('[data-testid="menu-toggle"]');
    this.helpButton = page.locator('[data-testid="help-button"]');
    this.fileUploadArea = page.locator('input[type="file"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.waitForPageLoad();
  }

  async clickDemoButton(): Promise<void> {
    await this.demoButton.click();
  }

  async waitForDemoLoaded(): Promise<void> {
    // デモデータ読み込み完了を待機（マップが表示されるまで）
    await this.page.waitForSelector('.leaflet-container', { timeout: 30000 });
  }

  async waitForHelpButton(): Promise<void> {
    // メニューは自動で開くので、ヘルプボタンの出現を待機
    await this.helpButton.waitFor({ state: 'visible', timeout: 10000 });
  }

  async clickHelpButton(): Promise<void> {
    await this.helpButton.click();
  }
}
