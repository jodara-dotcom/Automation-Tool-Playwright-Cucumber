import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

Given('the user navigates to {string}', async function (this: CustomWorld, url: string) {
    await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }); // timeout to wait for DOM to be loaded.
    console.log(`[Step] Navigated to: ${url}`);
});

When('the user clicks on element found by {string} {string}', async function (this: CustomWorld, locatorType: string, locatorValue: string) {
    let locator;
    const clickTimeout = 15000; // Timeout by default for clicking actions

    console.log(`[Step] Attempting to click on element found by "${locatorType}" "${locatorValue}"`);

    switch (locatorType.toLowerCase()) {
        case 'text':
            locator = this.page.getByText(locatorValue);
            break;
        case 'css':
            locator = this.page.locator(locatorValue);
            break;
        case 'id':
            locator = this.page.locator(`#${locatorValue}`); //this will allow us to type the Id as plane text.
            break;
        case 'xpath':
            locator = this.page.locator(`xpath=${locatorValue}`);
            break;
        case 'role':
            const parts = locatorValue.split(',', 2).map(s => s.trim());
            if (parts.length === 2) {
                const role = parts[0] as Parameters<typeof this.page.getByRole>[0];
                const name = parts[1];
                locator = this.page.getByRole(role, { name: name });
            } else {
                throw new Error(`For locatorType 'role', locatorValue must be in format 'roleName,accessibleName'. Received: '${locatorValue}'`);
            }
            break;
        case 'label':
            locator = this.page.getByLabel(locatorValue);
            break;
        case 'placeholder':
            locator = this.page.getByPlaceholder(locatorValue);
            break;
        case 'alt':
            locator = this.page.getByAltText(locatorValue);
            break;
        case 'title':
            locator = this.page.getByTitle(locatorValue);
            break;
        case 'testid':
            locator = this.page.getByTestId(locatorValue);
            break;
        default:
            throw new Error(`Locator type "${locatorType}" not supported. Supported types: text, css, xpath, role, label, placeholder, alt, title, testid.`);
    }
    await locator.click({ timeout: clickTimeout });
    console.log(`[Step] Successfully clicked on element found by "${locatorType}" "${locatorValue}"`);
});
