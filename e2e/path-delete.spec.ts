import { test, expect } from '@playwright/test';

const EDITOR_LOCATOR = '.pf-v6-c-page';

test.describe('Path deletion', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.locator(EDITOR_LOCATOR)).toBeVisible({ timeout: 15000 });
    });

    test('trash icon appears next to path items', async ({ page }) => {
        // The default Pet Store API has paths - verify trash icons are present
        const trashButton = page.getByRole('button', { name: /^Delete path / });
        await expect(trashButton.first()).toBeVisible();
    });

    test('clicking trash icon opens confirmation dialog', async ({ page }) => {
        // Click the trash icon on the first path
        const trashButton = page.getByRole('button', { name: /^Delete path / }).first();
        await trashButton.click();

        // Verify the confirmation modal appears
        await expect(page.getByText('Delete Path')).toBeVisible();
        await expect(page.getByText('Are you sure you want to delete the path')).toBeVisible();
    });

    test('cancel button closes confirmation dialog without deleting', async ({ page }) => {
        // Count initial paths
        const initialTrashButtons = page.getByRole('button', { name: /^Delete path / });
        const initialCount = await initialTrashButtons.count();

        // Click trash on the first path
        await initialTrashButtons.first().click();

        // Verify dialog is open
        await expect(page.getByText('Are you sure you want to delete the path')).toBeVisible();

        // Click Cancel
        await page.getByRole('button', { name: 'Cancel' }).click();

        // Verify dialog is closed
        await expect(page.getByText('Are you sure you want to delete the path')).not.toBeVisible();

        // Verify path count is unchanged
        await expect(page.getByRole('button', { name: /^Delete path / })).toHaveCount(initialCount);
    });

    test('create a path then delete it via trash icon', async ({ page }) => {
        const testPath = '/test-delete-path';

        // Click the add path button
        await page.getByRole('button', { name: 'Add path' }).click();

        // Fill in the path name and create it
        await page.getByPlaceholder('/pets').fill(testPath);
        await page.getByRole('button', { name: 'Create' }).click();

        // Verify the new path appears in the navigation
        await expect(page.getByText(testPath)).toBeVisible();

        // Find and click the trash icon for our test path
        const trashButton = page.getByRole('button', { name: `Delete path ${testPath}` });
        await expect(trashButton).toBeVisible();
        await trashButton.click();

        // Verify the confirmation dialog shows the correct path name
        await expect(page.getByText('Are you sure you want to delete the path')).toBeVisible();
        const modalBody = page.locator('.pf-v6-c-modal-box__body');
        await expect(modalBody).toContainText(testPath);

        // Click Delete to confirm
        await page.getByRole('button', { name: 'Delete' }).click();

        // Verify the dialog is closed
        await expect(page.getByText('Are you sure you want to delete the path')).not.toBeVisible();

        // Verify the path is gone from the navigation
        await expect(page.getByRole('button', { name: `Delete path ${testPath}` })).not.toBeVisible();
    });

    test('schemas section does not have trash icons', async ({ page }) => {
        // Schemas should not have delete buttons (only paths do)
        const schemaTrashButton = page.getByRole('button', { name: /^Delete schema / });
        await expect(schemaTrashButton).toHaveCount(0);
    });
});
