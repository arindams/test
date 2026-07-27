import { Before, After, setDefaultTimeout, Status } from '@cucumber/cucumber';
import { chromium, request } from '@playwright/test';
import { PlaywrightWorld } from './world';
import { createHomeLoanPage } from '../../pages/homeLoanPage';
import { createPersonalLoanPage } from '../../pages/personalLoanPage';
import { loadLoanFixtures } from '../../fixtures/fixture.loader';
import config from '../../config/env.config';
import { AppLogger, LogRegistry } from '../../utils/loggerContext';

setDefaultTimeout(config.cucumberDefaultTimeout);

Before(async function (this: PlaywrightWorld) {

  let screenSize;
  let tempContext;
  let tempPage;
  LogRegistry.register({
    workerInfo: this.workerInfo,
    worldId: this.worldId
  });

  AppLogger.log(` [Lifecycle: START]  Scenario execution begins using ID`);


  this.browser = await chromium.launch({
    headless: config.headless,
    args: config.headless
      ? ['--headless=new'] // Forcing the native, comprehensive headless mode pipeline
      : ['--start-maximized']
  });

  if (!config.headless) {

    // 2. Open an unconstrained temporary context to extract display metrics
    tempContext = await this.browser.newContext({ viewport: null });
    tempPage = await tempContext.newPage();

    // Extract your physical screen's exact pixel boundaries directly from the window object
    screenSize = await tempPage.evaluate(() => {
      return {
        width: window.screen.availWidth,
        height: window.screen.availHeight
      };
    });
    // Close the discovery context
    await tempContext.close();
  } else {
    // 3. Headless Mode: Standardise a high-res desktop boundary so all 5 bars fit
    screenSize = {
      width: 1920,
      height: 1080
    };
  }

  // 3. Re-initialize your primary context mapped directly to your screen's precise limits
  this.context = await this.browser.newContext({
    viewport: { width: screenSize.width, height: screenSize.height }
  });
  this.page = await this.context.newPage();
  this.page.setDefaultNavigationTimeout(config.playwrightDefaultTimeout);
  this.page.setDefaultTimeout(config.playwrightDefaultTimeout)

  this.apiRetryOptions = {
    retries: config.apiRetries,
    delay: config.apiRetryDelay,
    statusCodesToRetry: config.statusCodesToRetry,
    enableTracer: config.enableApiTracer
  };
  this.apiContext = await request.newContext({
    baseURL: config.apiBaseUrl,
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });

  //Initialize Test Data & Page Object Fixtures
  this.testData = loadLoanFixtures();
  this.homeLoanPage = createHomeLoanPage(this.page);
  this.personalLoanPage = createPersonalLoanPage(this.page);
});

After(async function (this: PlaywrightWorld, scenario) {
  if (scenario.result?.status === Status.FAILED && this.page) {
    const screenshot = await this.page.screenshot({ path: `reports/screenshots/${scenario.pickle.name}.png` });
    this.attach(screenshot, 'image/png');
  }

  if (this.page) await this.page.close();
  if (this.context) await this.context.close();
  if (this.browser) await this.browser.close();
  if (this.apiContext) await this.apiContext.dispose();
  AppLogger.log(`[Lifecycle: EVICT]  Scenario execution ended. Evicting and destroying ID`);
  LogRegistry.unregister();
});
