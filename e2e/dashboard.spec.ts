import { test, expect } from '@playwright/test';

test.describe('管理画面ダッシュボード', () => {
  test.beforeEach(async ({ page }) => {
    // ダッシュボードページに移動
    await page.goto('/');
  });

  test('ダッシュボードのタイトルが正しく表示される', async ({ page }) => {
    // ダッシュボードのタイトルが表示されていることを確認
    await expect(page.locator('h1')).toContainText('ダッシュボード');
  });

  test('統計カードが正しく表示される', async ({ page }) => {
    // 統計カードが4つ表示されていることを確認
    await expect(page.locator('.card').filter({ hasText: 'ユーザー数' })).toBeVisible();
    await expect(page.locator('.card').filter({ hasText: '売上' })).toBeVisible();
    await expect(page.locator('.card').filter({ hasText: '注文数' })).toBeVisible();
    await expect(page.locator('.card').filter({ hasText: '直帰率' })).toBeVisible();
  });

  test('ナビゲーションが正しく機能する', async ({ page }) => {
    // ユーザー管理ページへのリンクをクリック
    await page.locator('a').filter({ hasText: 'ユーザー管理' }).click();
    
    // URLが/usersに変わったことを確認
    await expect(page).toHaveURL('/users');
    
    // ユーザー管理ページのタイトルが表示されていることを確認
    await expect(page.locator('h1')).toContainText('ユーザー管理');
    
    // 分析ページへのリンクをクリック
    await page.locator('a').filter({ hasText: '分析' }).click();
    
    // URLが/analyticsに変わったことを確認
    await expect(page).toHaveURL('/analytics');
    
    // 分析ページのタイトルが表示されていることを確認
    await expect(page.locator('h1')).toContainText('分析ダッシュボード');
    
    // 設定ページへのリンクをクリック
    await page.locator('a').filter({ hasText: '設定' }).click();
    
    // URLが/settingsに変わったことを確認
    await expect(page).toHaveURL('/settings');
    
    // 設定ページのタイトルが表示されていることを確認
    await expect(page.locator('h1')).toContainText('設定');
    
    // ダッシュボードに戻る
    await page.locator('a').filter({ hasText: 'ダッシュボード' }).click();
    
    // URLがルートに変わったことを確認
    await expect(page).toHaveURL('/');
  });

  test('レスポンシブデザインが正しく機能する', async ({ page }) => {
    // モバイルビューに設定
    await page.setViewportSize({ width: 375, height: 667 });
    
    // サイドバーがデフォルトで非表示になっていることを確認
    await expect(page.locator('.drawer-side').filter({ hasText: 'F0' })).not.toBeVisible();
    
    // メニューボタンをクリック
    await page.locator('label[for="drawer-toggle"]').click();
    
    // サイドバーが表示されることを確認
    await expect(page.locator('.drawer-side').filter({ hasText: 'F0' })).toBeVisible();
    
    // タブレットビューに設定
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // サイドバーがデフォルトで非表示になっていることを確認
    await expect(page.locator('.drawer-side').filter({ hasText: 'F0' })).not.toBeVisible();
    
    // デスクトップビューに設定
    await page.setViewportSize({ width: 1280, height: 800 });
    
    // サイドバーが自動的に表示されることを確認
    await expect(page.locator('.drawer-side').filter({ hasText: 'F0' })).toBeVisible();
  });
});
