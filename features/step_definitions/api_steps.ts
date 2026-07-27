import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PlaywrightWorld } from '../support/world';
import { AppLogger } from '../../utils/loggerContext';
import { requestWithRetry } from '../../utils/api/requestWithRetry';
import { validateResponse } from '../../utils/assertions/genericAssertion';

const payloads: Record<string, any> = {
  'Excessively Long Title': { title: 'A'.repeat(10000), body: 'Boundary test', userId: 1 },
  'Special Characters Title': { title: 'SELECT * FROM users;', body: 'Special Character', userId: 1 },
  'Missing Required Fields': { body: 'Missing title and userId' }
};

Given('The API service is reachable', async function (this: PlaywrightWorld) {
  expect(this.apiContext).toBeDefined();
});

When('I send a POST request with payload type {string}', async function (this: PlaywrightWorld, testCase: string) {
  const payload = payloads[testCase] || { title: 'default' };
  AppLogger.log(`[ACTION] Sending request with payload ${payload}`)
  this.apiResponse = await requestWithRetry(this.apiContext!, 'POST', '/posts', { data: payload }, this.apiRetryOptions)
});


Then('The response status code should be acceptable without internal server errors and response should have for request payload {string}', async function (this: PlaywrightWorld, testCase: string) {
  const status = this.apiResponse.status();
  expect(status).toBeLessThan(500);
  expect([200, 201, 400, 422]).toContain(status);
  const json = await this.apiResponse.json();
  validateResponse(payloads[testCase] || { title: 'default' }, json, {
    id: (value) => {
      expect(typeof value).toBe('number');
      expect(value).toBeGreaterThan(0);
    },
  },)
});