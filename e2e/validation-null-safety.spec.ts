import { test, expect, type Page, type ConsoleMessage } from '@playwright/test';

interface CapturedErrors {
    pageErrors: Error[];
    consoleErrors: string[];
}

function captureErrors(page: Page): CapturedErrors {
    const captured: CapturedErrors = { pageErrors: [], consoleErrors: [] };
    page.on('pageerror', (error) => captured.pageErrors.push(error));
    page.on('console', (msg: ConsoleMessage) => {
        if (msg.type() === 'error') captured.consoleErrors.push(msg.text());
    });
    return captured;
}

function hasNullObjectError(messages: (Error | string)[]): (Error | string)[] {
    return messages.filter((m) => {
        const text = m instanceof Error ? m.message : m;
        return text.includes('Cannot convert undefined or null to object');
    });
}

const EDITOR_LOCATOR = '.pf-v6-c-page';

test.describe('Validation null-safety', () => {
    test('editor loads default document without JavaScript errors', async ({ page }) => {
        const captured = captureErrors(page);

        await page.goto('/');
        await expect(page.locator(EDITOR_LOCATOR)).toBeVisible({ timeout: 15000 });

        expect(hasNullObjectError(captured.pageErrors)).toHaveLength(0);
        expect(hasNullObjectError(captured.consoleErrors)).toHaveLength(0);
    });

    test('editor renders the OpenAPIEditor component', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator(EDITOR_LOCATOR)).toBeVisible({ timeout: 15000 });
        await expect(page.getByText('Apicurio OpenAPI Editor - Test Application')).toBeVisible();
    });

    test('editor handles document load without crashes', async ({ page }) => {
        const captured = captureErrors(page);

        await page.goto('/');
        await expect(page.locator(EDITOR_LOCATOR)).toBeVisible({ timeout: 15000 });

        await page.getByRole('button', { name: 'Empty API' }).click();

        expect(captured.pageErrors).toHaveLength(0);
    });

    test('no console errors when loading 2.0 Example API with security definitions', async ({ page }) => {
        const captured = captureErrors(page);

        await page.goto('/');
        await expect(page.locator(EDITOR_LOCATOR)).toBeVisible({ timeout: 15000 });

        await page.getByRole('button', { name: '2.0 Example API' }).click();

        expect(hasNullObjectError(captured.pageErrors)).toHaveLength(0);
        expect(hasNullObjectError(captured.consoleErrors)).toHaveLength(0);
    });
});
