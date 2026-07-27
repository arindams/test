import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, APIRequestContext } from '@playwright/test';
import { HomeLoanPage } from '../../pages/homeLoanPage';
import { PersonalLoanPage } from '../../pages/personalLoanPage';
import { LoanTestData } from '../../fixtures/fixture.loader';
import { RetryOptions } from '../../utils/api/requestWithRetry';

export interface CustomWorld extends World {
  worldId: string; //  tracking identifier
  workerInfo: string; // worker tracking string
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  apiContext?: APIRequestContext;
  apiRetryOptions: RetryOptions;
  apiResponse?: any;

  // Injected Page Objects & Test Data Fixtures
  homeLoanPage?: HomeLoanPage;
  personalLoanPage?: PersonalLoanPage;
  testData?: LoanTestData;
}

export class PlaywrightWorld extends World implements CustomWorld {
  public worldId: string;
  public workerInfo: string;
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  apiContext?: APIRequestContext;
  apiRetryOptions!: RetryOptions;
  apiResponse?: any;

  homeLoanPage?: HomeLoanPage;
  personalLoanPage?: PersonalLoanPage;
  testData?: LoanTestData;

  constructor(options: IWorldOptions) {
    super(options);

    const rawWorkerId = process.env.CUCUMBER_WORKER_ID || process.env.CUCUMBER_PARALLEL_WORKER_ID;
    const workerIndex = rawWorkerId !== undefined ? rawWorkerId : 'Single';
    this.workerInfo = `[PID: ${process.pid} | Worker: ${workerIndex}]`;
    this.worldId = `World-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

  }
}

setWorldConstructor(PlaywrightWorld);
