// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Field Uploader', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for app initialization
    await page.waitForLoadState('domcontentloaded');
  });

  test('페이지 로드 확인', async ({ page }) => {
    // 핵심 UI 요소 확인
    await expect(page.locator('#capture-btn')).toBeVisible();
    await expect(page.locator('#title-input')).toBeVisible();
    await expect(page.locator('#upload-btn')).toBeVisible();
    await expect(page.locator('#status')).toBeVisible();
  });

  test('제목과 사진 없이 전송 버튼 비활성화', async ({ page }) => {
    // upload-btn should be disabled initially
    const uploadBtn = page.locator('#upload-btn');
    await expect(uploadBtn).toBeDisabled();
  });

  test('제목 입력 필드 동작', async ({ page }) => {
    const titleInput = page.locator('#title-input');
    await titleInput.fill('테스트 제목');
    await expect(titleInput).toHaveValue('테스트 제목');
  });

  test('상태 표시 영역 초기값', async ({ page }) => {
    const status = page.locator('#status');

    // 초기 상태: 모두 0
    await expect(status.locator('.pending')).toContainText('0');
    await expect(status.locator('.completed')).toContainText('0');
  });

  test('모바일 뷰포트에서 UI 확인', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // 촬영 버튼이 보이는지 확인
    const captureBtn = page.locator('#capture-btn');
    await expect(captureBtn).toBeVisible();

    // 버튼에 이모지가 있는지 확인
    await expect(captureBtn).toContainText('📷');
  });

});

test.describe('오프라인 기능', () => {

  test('오프라인 상태에서 IndexedDB 사용 가능', async ({ page, context }) => {
    await page.goto('/');

    // 오프라인 모드 설정
    await context.setOffline(true);

    // IndexedDB 접근 가능 확인
    const hasIndexedDB = await page.evaluate(() => {
      return 'indexedDB' in window;
    });

    expect(hasIndexedDB).toBe(true);
  });

  test('온라인 복구 감지', async ({ page, context }) => {
    await page.goto('/');

    // 오프라인 → 온라인 전환
    await context.setOffline(true);
    await page.waitForTimeout(500);
    await context.setOffline(false);

    // 온라인 상태 확인
    const isOnline = await page.evaluate(() => navigator.onLine);
    expect(isOnline).toBe(true);
  });

});

test.describe('PWA 기능', () => {

  test('manifest 링크 존재', async ({ page }) => {
    await page.goto('/');

    // manifest link가 head에 있는지 확인
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', /manifest/);
  });

  test('viewport meta 태그 확인', async ({ page }) => {
    await page.goto('/');

    // viewport meta가 올바르게 설정되어 있는지 확인
    const viewport = page.locator('meta[name="viewport"]');
    const content = await viewport.getAttribute('content');
    expect(content).toContain('width=device-width');
  });

  test('theme-color 설정 확인', async ({ page }) => {
    await page.goto('/');

    const themeColor = page.locator('meta[name="theme-color"]');
    await expect(themeColor).toHaveAttribute('content', '#1a1a2e');
  });

});
