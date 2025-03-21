import { test, expect } from '@playwright/test';

test.describe('Content Accessibility Tests', () => {
  test('should access the build and verify homepage loads', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page loaded successfully
    expect(await page.title()).toBeTruthy();
    
    // Verify some basic content is present
    const mainContent = await page.getByRole('main');
    await expect(mainContent).toBeVisible();
  });

  test('should access and read Genesis 1:1', async ({ page }) => {
    // Navigate to Genesis 1:1
    await page.goto('/genesis/1/1');
    
    // Verify the page loads
    await expect(page).toHaveTitle(/Genesis 1:1/);
    
    // Verify the verse content is present
    const verseContent = await page.getByRole('article');
    await expect(verseContent).toBeVisible();
    
    // Verify specific content elements
    const verseReference = await page.getByText('Genesis 1:1');
    await expect(verseReference).toBeVisible();
    
    // Check if the commentary content is loaded
    const commentary = await page.getByRole('article').textContent();
    expect(commentary).toBeTruthy();
    expect(commentary?.length).toBeGreaterThan(0);
  });
});
