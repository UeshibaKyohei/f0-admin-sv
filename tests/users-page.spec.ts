import { test, expect } from '@playwright/test';

test('ユーザー管理ページが正しく表示されるか', async ({ page }) => {
  // トップページにアクセス
  await page.goto('/');
  
  // サイドバーのユーザー管理リンクをクリック
  await page.click('text=ユーザー管理');
  
  // URLが/usersになっているか確認
  await expect(page).toHaveURL('/users');
  
  // ページタイトルが表示されているか確認
  await expect(page.locator('h1:has-text("ユーザー管理")')).toBeVisible();
  
  // ユーザーテーブルが表示されているか確認
  await expect(page.locator('table')).toBeVisible();
  
  // コンソールエラーをキャプチャ
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  // テスト終了時にエラーがあれば出力
  test.afterEach(() => {
    if (errors.length > 0) {
      console.log('Console errors:', errors);
    }
  });
});
