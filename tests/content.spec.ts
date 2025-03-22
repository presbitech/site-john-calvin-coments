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
    // Navigate to Genesis 1:1 (using lowercase as per directory structure)
    await page.goto('/genesis/1/1');
    
    // Wait for content to load
    await page.waitForTimeout(1000);

    // Verify we don't see a 404 heading
    const notFoundHeading = page.getByRole('heading', { name: '404', level: 1 });
    await expect(notFoundHeading).not.toBeVisible();
    
    // Instead we should see a proper heading for Genesis 1
    const genesisHeading = page.getByRole('heading', { name: /Genesis 1/, level: 1 });
    await expect(genesisHeading).toBeVisible();
  });
});
