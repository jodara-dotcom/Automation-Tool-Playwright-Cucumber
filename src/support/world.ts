import { setWorldConstructor, World, IWorldOptions, Before, After, ITestCaseHookParameter } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

export interface CustomWorld extends World {
browser: Browser;
context: BrowserContext;
page: Page;
testName: string;
setup(): Promise<void>;
teardown(): Promise<void>;
}

class CustomWorldImpl extends World implements CustomWorld {
browser!: Browser;
context!: BrowserContext;
page!: Page;
testName: string = 'unnamed-scenario';

constructor(options: IWorldOptions) {
  super(options);
}

async setup(): Promise<void> {
  const isHeadless = process.env.PLAYWRIGHT_HEADLESS !== 'false';
  const recordVideo = isHeadless; // <-- Only record video when headless

  console.log(`[DEBUG] Setup for scenario "${this.testName}" started. Headless: ${isHeadless}, Record Video: ${recordVideo}`);
  try {
    const videoDir = path.resolve(process.cwd(), 'videos');
    if (!fs.existsSync(videoDir)) {
      fs.mkdirSync(videoDir, { recursive: true });
    }

    console.log(`[DEBUG] Attempting to launch Chromium...`);
    this.browser = await chromium.launch({
      headless: isHeadless,
      args: ['--no-sandbox'],
    });
    console.log(`[DEBUG] Chromium launched.`);

    console.log(`[DEBUG] Creating new browser context...`);
    const contextOptions: { recordVideo?: { dir: string; size: { width: number; height: number; } } } = {};
    if (recordVideo) { // <-- condition to record video
      contextOptions.recordVideo = {
        dir: videoDir,
        size: { width: 1280, height: 720 },
      };
    }
    this.context = await this.browser.newContext(contextOptions);
    console.log(`[DEBUG] Browser context created.`);

    this.page = await this.context.newPage();
    console.log(`[DEBUG] Page created for scenario "${this.testName}".`);
    console.log(`[DEBUG] Setup for scenario "${this.testName}" completed. Browser opened.`);
  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred during setup.';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    console.error(`[DEBUG] Error during setup for "${this.testName}": ${errorMessage}`);
    if (this.page && !this.page.isClosed()) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
    throw error;
  }
}

async teardown(): Promise<void> {
  console.log(`[DEBUG] Teardown for scenario "${this.testName}" started.`);
  try {
    const video = this.page.video();
    const recordVideo = process.env.PLAYWRIGHT_HEADLESS !== 'false'; 

    if (video && recordVideo) { // <-- Proceed only if video was recorded. 
      const sanitizedTestName = this.testName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const videoFullPath = await video.path(); 
      
      if (videoFullPath) {
          const newVideoPath = path.join(path.dirname(videoFullPath), `${sanitizedTestName}.webm`);
          await video.saveAs(newVideoPath);
          await video.delete();
          console.log(`[DEBUG] Video recorded and saved at: ${newVideoPath}`);
      } else {
          console.log(`[DEBUG] No temporary video path available for "${this.testName}".`);
      }
    } else if (!recordVideo) {
      console.log(`[DEBUG] Video recording was disabled for "${this.testName}".`);
    } else { // video is undefined
      console.log(`[DEBUG] No video object for scenario "${this.testName}".`);
    }
  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred during video processing in teardown.';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    console.error(`[DEBUG] Error during video processing in teardown for "${this.testName}": ${errorMessage}`);
  } finally {
    console.log(`[DEBUG] Closing page, context, browser...`);
    try {
      if (this.page && !this.page.isClosed()) {
          await this.page.close();
          console.log(`[DEBUG] Page closed for "${this.testName}".`);
      }
    } catch (error: unknown) {
      let errorMessage = 'An unknown error occurred while closing page.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      console.error(`[DEBUG] Error closing page for "${this.testName}": ${errorMessage}`);
    }
    try {
      if (this.context) {
          await this.context.close();
          console.log(`[DEBUG] Context closed for "${this.testName}".`);
      }
    } catch (error: unknown) {
      let errorMessage = 'An unknown error occurred while closing context.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      console.error(`[DEBUG] Error closing context for "${this.testName}": ${errorMessage}`);
    }
    try {
      if (this.browser) {
          await this.browser.close();
          console.log(`[DEBUG] Browser closed for "${this.testName}".`);
      }
    } catch (error: unknown) {
      let errorMessage = 'An unknown error occurred while closing browser.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      console.error(`[DEBUG] Error closing browser for "${this.testName}": ${errorMessage}`);
    }
  }
  console.log(`[DEBUG] Teardown for scenario "${this.testName}" completed.`);
}
}

setWorldConstructor(CustomWorldImpl);

Before(async function(this: CustomWorld, scenario: ITestCaseHookParameter) {
this.testName = scenario.pickle.name;
await this.setup();
});

After(async function(this: CustomWorld) {
await this.teardown();
});