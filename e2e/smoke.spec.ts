import { test, expect } from '@playwright/test';
import { TopPage, HelpModal } from './pages';

test.describe('Smoke E2E Tests', () => {
  test('デモを試す → ヘルプ → バージョン情報表示確認', async ({ page }) => {
    // 1. トップページにアクセス
    const topPage = new TopPage(page);
    await topPage.goto();

    // 2. 「デモを試す」ボタンをクリック
    await topPage.clickDemoButton();
    await topPage.waitForDemoLoaded();

    // 3. メニューは自動で開くので、ヘルプボタンの出現を待機
    await topPage.waitForHelpButton();

    // 4. ヘルプボタンをクリック
    await topPage.clickHelpButton();

    // 5. ヘルプモーダルが開くことを確認
    const helpModal = new HelpModal(page);
    await helpModal.waitForOpen();

    // 6. バージョン情報が表示されていることを確認
    await helpModal.expectVersionInfoVisible();
    
    // 7. バージョン情報のフォーマットを確認
    // 開発環境: "1.0.3-dev" or 本番: "Build: 1.0.3-YYYYMMDD-NNN"
    const versionText = await helpModal.getVersionInfo();
    expect(versionText).toMatch(/^\d+\.\d+\.\d+-dev$|^Build: \d+\.\d+\.\d+-\d{8}-\d{3}$/);
  });
});
