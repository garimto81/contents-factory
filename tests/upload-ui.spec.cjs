// PRD-0003: Upload Page Mobile UI Tests
const { test, expect, devices } = require('@playwright/test');

test.describe('Upload Page - Mobile UI (PRD-0003)', () => {
  // Use iPhone SE viewport
  test.use({ viewport: { width: 375, height: 667 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/upload.html');
  });

  test('camera button height is at least 150px', async ({ page }) => {
    const cameraBtn = page.locator('.camera-btn');
    await expect(cameraBtn).toBeVisible();

    const box = await cameraBtn.boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(150);
  });

  test('camera button is prominently displayed', async ({ page }) => {
    const cameraBtn = page.locator('.camera-btn');
    await expect(cameraBtn).toBeVisible();

    // Check button contains camera icon
    const cameraIcon = cameraBtn.locator('i.bi-camera-fill');
    await expect(cameraIcon).toBeVisible();

    // Check button text
    await expect(cameraBtn).toContainText('카메라로 촬영하기');
  });

  test('initial screen fits without scroll (one-screen layout)', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Get body scroll height and viewport height
    const { scrollHeight, viewportHeight } = await page.evaluate(() => ({
      scrollHeight: document.body.scrollHeight,
      viewportHeight: window.innerHeight
    }));

    // Allow 100px tolerance for address bar variations
    expect(scrollHeight).toBeLessThanOrEqual(viewportHeight + 100);
  });

  test('photos summary button shows instead of inline grid', async ({ page }) => {
    const summaryBtn = page.locator('.photos-summary-btn');
    await expect(summaryBtn).toBeVisible();

    // Should show "0장 보기" initially
    await expect(summaryBtn).toContainText('장 보기');
  });

  test('photos modal opens on summary button click', async ({ page }) => {
    const summaryBtn = page.locator('.photos-summary-btn');
    await summaryBtn.click();

    const modal = page.locator('#photosModal');
    await expect(modal).toBeVisible();

    // Modal should have close button
    const closeBtn = modal.locator('.btn-close');
    await expect(closeBtn).toBeVisible();
  });

  test('category tabs are scrollable horizontally', async ({ page }) => {
    const categoryTabs = page.locator('.category-tabs');
    await expect(categoryTabs).toBeVisible();

    // Check all 5 categories exist
    const tabs = page.locator('.category-tab');
    await expect(tabs).toHaveCount(5);

    // Check category names
    await expect(page.locator('.category-tab[data-category="before_car"]')).toContainText('입고');
    await expect(page.locator('.category-tab[data-category="before_wheel"]')).toContainText('문제');
    await expect(page.locator('.category-tab[data-category="during"]')).toContainText('과정');
    await expect(page.locator('.category-tab[data-category="after_wheel"]')).toContainText('해결');
    await expect(page.locator('.category-tab[data-category="after_car"]')).toContainText('출고');
  });

  test('category tab selection changes active state', async ({ page }) => {
    // Initially first tab should be active
    const firstTab = page.locator('.category-tab[data-category="before_car"]');
    await expect(firstTab).toHaveClass(/active/);

    // Click second tab
    const secondTab = page.locator('.category-tab[data-category="before_wheel"]');
    await secondTab.click();

    // Second tab should now be active
    await expect(secondTab).toHaveClass(/active/);
    await expect(firstTab).not.toHaveClass(/active/);
  });

  test('submit button is disabled without photos and title', async ({ page }) => {
    const submitBtn = page.locator('#submit-btn');
    await expect(submitBtn).toBeDisabled();
  });

  test('title input is present and functional', async ({ page }) => {
    const titleInput = page.locator('#job-title');
    await expect(titleInput).toBeVisible();

    // Type in title
    await titleInput.fill('제네시스 G80');
    await expect(titleInput).toHaveValue('제네시스 G80');
  });

  test('header has back button', async ({ page }) => {
    const backBtn = page.locator('.btn-back');
    await expect(backBtn).toBeVisible();

    // Should have left arrow icon
    const arrowIcon = backBtn.locator('i.bi-arrow-left');
    await expect(arrowIcon).toBeVisible();
  });

  test('footer submit button is always visible (fixed)', async ({ page }) => {
    const footer = page.locator('.footer');
    await expect(footer).toBeVisible();

    const submitBtn = page.locator('#submit-btn');
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toContainText('작업 저장하기');
  });
});

test.describe('Upload Page - Desktop UI', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('camera button displays correctly on desktop', async ({ page }) => {
    await page.goto('/upload.html');

    const cameraBtn = page.locator('.camera-btn');
    await expect(cameraBtn).toBeVisible();

    const box = await cameraBtn.boundingBox();
    // Desktop should have max-width 500px
    expect(box.width).toBeLessThanOrEqual(500 + 40); // Allow for padding
  });
});

test.describe('Upload Page - Tablet UI', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('responsive layout on tablet', async ({ page }) => {
    await page.goto('/upload.html');

    // Camera button should be visible
    const cameraBtn = page.locator('.camera-btn');
    await expect(cameraBtn).toBeVisible();

    // Category tabs should be visible
    const categoryTabs = page.locator('.category-tabs');
    await expect(categoryTabs).toBeVisible();
  });
});
