import { Page } from '@playwright/test';
import { createPageActions } from './pageActions';

export interface HomeLoanInputData {
  amount: number;
  interestRate: number;
  tenureYears: number;
}

export const createHomeLoanPage = (page: Page) => {
  const actions = createPageActions(page);

  const homeLoanTab = page.locator('#home-loan');
  const loanAmountInput = page.locator('#loanamount');
  const interestRateInput = page.locator('#loaninterest');
  const tenureInput = page.locator('#loanterm');
  const emiResultValue = page.locator('#emipaymentsummary #emiamount span');
  const pieChartContainer = page.locator('#emipiechart');

  return {
    async navigate(url: string): Promise<void> {
      await actions.navigateTo(url);
    },

    async clickHomeLoanTab(): Promise<void> {
      await homeLoanTab.click();
    },

    async enterLoanDetails({ amount, interestRate, tenureYears }: HomeLoanInputData): Promise<void> {
      await loanAmountInput.fill(amount.toString());
      await interestRateInput.fill(interestRate.toString());
      await tenureInput.fill(tenureYears.toString());
      await tenureInput.press('Tab');
    },

    async getDisplayedEMI(): Promise<number> {
      const text = await emiResultValue.innerText();
      return parseInt(text.replace(/,/g, ''), 10);
    },

    async isPieChartVisible(): Promise<boolean> {
      return await pieChartContainer.isVisible();
    },

    async getPieChartValues(): Promise<number[]> {
      return await page.evaluate(() => {
        const chart = (window as any).Highcharts?.charts?.find((c: any) => c?.renderTo?.id === 'emipiechart');
        if (!chart) return [];
        return chart.series[0].data.map((point: any) => point.percentage);
      });
    }
  };
};

export type HomeLoanPage = ReturnType<typeof createHomeLoanPage>;