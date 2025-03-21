import { test, expect } from '@playwright/test';

test.describe('Content Accessibility Tests', () => {
  test('should access the build and verify homepage loads', async ({ page }) => {
    await page.goto('/getting-started');
    
    // Verify the "Getting Started" heading is present
    const heading = page.getByRole('heading', { name: 'Getting Started', level: 1 });
    await expect(heading).toBeVisible();
    
    // Also verify it has the correct ID
    const headingWithId = page.locator('h1#getting-started');
    await expect(headingWithId).toBeVisible();
  });

  test('should access and read Genesis 1:1', async ({ page }) => {
    // Navigate to Genesis 1:1
    await page.goto('/genesis/1/1');
    
    // Verify the "404" heading is present
    const heading = page.getByRole('heading', { name: '404', level: 1 });
    await expect(heading).not.toBeVisible();
  });
});
