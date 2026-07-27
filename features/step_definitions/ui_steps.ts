import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PlaywrightWorld } from '../support/world';
import { calculateEMI } from '../../utils/emiCalculator';
import config from '../../config/env.config';
import { AppLogger } from '../../utils/loggerContext';

let currentParams = { amount: 0, interest: 0, tenure: 0 };
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms)); // Use it only for debugging


Given('I launch the EMI calculator application', async function (this: PlaywrightWorld) {
  //Page object fixture used directly from World context
  await this.homeLoanPage!.navigate(config.baseUrl);
});

When('I navigate to the Home Loan section', async function (this: PlaywrightWorld) {
  await this.homeLoanPage!.clickHomeLoanTab();
});

When('I enter loan details using fixture key {string}', async function (this: PlaywrightWorld, fixtureKey: string) {
  //Test data fixture loaded from World context
  const fixture = this.testData!.homeLoan[fixtureKey];
  if (!fixture) throw new Error(`Fixture key "${fixtureKey}" not found in loanData.json`);

  currentParams = { amount: fixture.amount, interest: fixture.interestRate, tenure: fixture.tenureYears };
  await this.homeLoanPage!.enterLoanDetails({
    amount: fixture.amount,
    interestRate: fixture.interestRate,
    tenureYears: fixture.tenureYears
  });
});

Then('The calculated EMI should match the displayed EMI value', async function (this: PlaywrightWorld) {
  const expectedEMI = calculateEMI({
    principal: currentParams.amount,
    annualInterestRate: currentParams.interest,
    tenureYears: currentParams.tenure
  });
  AppLogger.log(`Expected EMI is ${expectedEMI}`)
  const actualEMI = await this.homeLoanPage!.getDisplayedEMI();
  AppLogger.log(`Actual EMI is ${actualEMI}`)

  expect(actualEMI).toBeDefined();
  expect(Math.abs(actualEMI - expectedEMI)).toBeLessThanOrEqual(2);
});

Then('The pie chart should be visible and contain valid non-zero values', async function (this: PlaywrightWorld) {
  const isVisible = await this.homeLoanPage!.isPieChartVisible();
  expect(isVisible).toBeTruthy();

  const values = await this.homeLoanPage!.getPieChartValues();
  AppLogger.log(`Pie Chart Values are ${JSON.stringify(values)}`)
  expect(values.length).toBeGreaterThan(0);
  values.forEach((v) => expect(v).toBeGreaterThan(0));
});

When('I switch to the Personal Loan section', async function (this: PlaywrightWorld) {
  await this.personalLoanPage!.clickPersonalLoanTab();
});

When('I fill in personal loan parameters via slider using standard fixture profile', async function (this: PlaywrightWorld) {
  const profile = this.testData!.personalLoan.standard;
  let actualCalendarInputValue = 'fail'
  await this.personalLoanPage!.setPersonalLoanDetailsUsingSlider(profile.amount, profile.interestRate, profile.tenureYears);
  if (profile.startDate) {
    actualCalendarInputValue = await this.personalLoanPage!.setStartMonth(profile.startDate.trim());
    expect(actualCalendarInputValue).toMatch(profile.startDate.split(' ')[0])
  }
});


Then('The bar chart payment schedule should be visible', async function (this: PlaywrightWorld) {
  const isVisible = await this.personalLoanPage!.isBarChartVisible();
  expect(isVisible).toBeTruthy();
});

Then('Hovering over chart bars should display active tooltip text', async function (this: PlaywrightWorld) {
  
  const tooltipRegex = /Year\s*:\s*\d{4}\s*(Principal|Interest)\s*:\s*₹?\s*[\d,]+\s*Total Payment\s*:\s*₹?\s*[\d,]+/i;
  const profile = this.testData!.personalLoan.standard;
  const barCount = await this.personalLoanPage!.getBarCount();
  expect(barCount/2 === profile.tenureYears || barCount/2 === profile.tenureYears+1).toBe(true);
  const tooltipText = await this.personalLoanPage!.hoverAndGetTooltipValue(0);
  expect(tooltipText).toBeTruthy();
  expect(tooltipText.length).toBeGreaterThan(0);
  expect(tooltipText).toMatch(tooltipRegex)

  
});