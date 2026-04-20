import { Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';


Then('the element found by {string} {string} is visible', async function (this: CustomWorld, locatorType: string, locatorValue: string) {
    let locator;
    const visibleTimeout = 25000;

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
    await expect(locator).toBeVisible({ timeout: visibleTimeout });
    console.log(`[Step] Element successfully rendered, found by "${locatorType}" "${locatorValue}"`);
});

Then('the element found by {string} {string} was successfully filled with the text {string}', async function (this: CustomWorld, locatorType: string, locatorValue: string, textValue: string) {
    let locator;
    const validationTimeout = 25000;

    console.log(`[Step] Attempting to validate text typed on element found by "${locatorType}" "${locatorValue}"`);

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
    await expect(locator).toHaveValue(textValue, { timeout: validationTimeout });
    console.log(`[Step] Typed text successfully validated on element found by "${locatorType}" "${locatorValue}"`);
});