import { Locator, Page } from '@playwright/test';
import { createPageActions } from './pageActions';
import { AppLogger } from '../utils/loggerContext';

export const createPersonalLoanPage = (page: Page) => {
  const actions = createPageActions(page);

  const personalLoanTab = page.locator('#emicalculatordashboard #personal-loan');
  const amountInput = page.locator('#loanamount');
  const interestInput = page.locator('#loaninterest');
  const tenureInput = page.locator('#loanterm');
  const calendarMonthPicker = page.locator('#startmonthyear');
  const monthSelector = async (month: string): Promise<Locator> => {
    return page.locator(`span:has-text("${month}")`)
  }
  const barChartContainer = page.locator('#emipaymentdetails #emibarchart');
  const barElements = barChartContainer.locator('.highcharts-series-group .highcharts-series .highcharts-point');
  const chartTooltipContents = barChartContainer.locator('.highcharts-tooltip text');

  const amountSliderTrack = page.locator('#loanamountslider');
  const amountSliderHandle = page.locator('#loanamountslider span.ui-slider-handle');

  const interestSliderTrack = page.locator('#loaninterestslider');
  const interestSliderHandle = page.locator('#loaninterestslider span.ui-slider-handle');

  const tenureSliderTrack = page.locator('#loanterm-slider, #loantermslider');
  const tenureSliderHandle = page.locator('#loanterm-slider span.ui-slider-handle, #loantermslider span.ui-slider-handle');

  const getCurrentInputValue = async (inputLocator: Locator): Promise<number> => {
    let val = await inputLocator.inputValue();
    val = val.replace(/,/g, '');
    AppLogger.log(`[Action] Read Slider current value which is ${val}`)
    return parseFloat(val) || 0;
  };

  const dragSliderByOffset = async (sliderHandle: Locator, xOffset: number): Promise<void> => {
    const box = await sliderHandle.boundingBox();
    if (box) {
      const startX = box.x + box.width / 2;
      const startY = box.y + box.height / 2;
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX + xOffset, startY);
      await page.mouse.up();
    } else {
      throw new Error('Slider handle element not visible or bounding box unavailable.');
    }
  };

  const dragAmountSlider = async (targetAmount: number, min = 0, max = 3000000): Promise<void> => {
    const currentVal = await getCurrentInputValue(amountInput);
    const xOffset = await calculateOffset(amountSliderTrack, targetAmount, min, max, currentVal);
    AppLogger.log(`[Action] Dragging Loan Amount slider by ${xOffset.toFixed(2)}px to target ${targetAmount}`);
    await dragSliderByOffset(amountSliderHandle, xOffset);
  };

  const dragInterestSlider = async (targetInterest: number, min = 5, max = 25): Promise<void> => {
    const currentVal = await getCurrentInputValue(interestInput);
    const xOffset = await calculateOffset(interestSliderTrack, targetInterest, min, max, currentVal);
    AppLogger.log(`[Action] Dragging Interest Rate slider by ${xOffset.toFixed(2)}px to target ${targetInterest}%`);
    await dragSliderByOffset(interestSliderHandle, xOffset);
  };

  const dragTenureSlider = async (targetTenureYears: number, min = 0.5, max = 5): Promise<void> => {
    const currentVal = await getCurrentInputValue(tenureInput);
    const xOffset = await calculateOffset(tenureSliderTrack, targetTenureYears, min, max, currentVal);
    AppLogger.log(`[Action] Dragging Loan Tenure slider by ${xOffset.toFixed(2)}px to target ${targetTenureYears} years`);
    await dragSliderByOffset(tenureSliderHandle, xOffset);
  };

  const calculateOffset = async (
    sliderTrack: Locator,
    targetValue: number,
    minValue: number,
    maxValue: number,
    currentValue: number
  ): Promise<number> => {
    const box = await sliderTrack.boundingBox();
    if (!box) {
      throw new Error('Slider track element is not visible or bounding box unavailable.');
    }
    const trackWidth = box.width;
    const valueRange = maxValue - minValue;
    const valueDelta = targetValue - currentValue;
    return (valueDelta / valueRange) * trackWidth;
  };

  return {
    async clickPersonalLoanTab(): Promise<void> {
      await personalLoanTab.click();
    },


    async setPersonalLoanDetailsUsingSlider(amount: number, interest: number, tenureYears: number): Promise<void> {
      AppLogger.log(`[Action] Sliding to loan amount: ${amount}`);
      await dragAmountSlider(amount)
      AppLogger.log(`[Action] Sliding to interest rate: ${interest}%`);
      await dragInterestSlider(interest);
      AppLogger.log(`[Action] Sliding to loan tenure: ${tenureYears} years`);
      await dragTenureSlider(tenureYears);
      AppLogger.log(`[Action] Pressing Tab to trigger calculations`);
      await tenureInput.press('Tab');
    },


    async setPersonalLoanDetails(amount: number, interest: number, tenureYears: number): Promise<void> {
      AppLogger.log(`[Action] Inputting loan amount: ${amount}`);
      await amountInput.fill(amount.toString());
      AppLogger.log(`[Action] Inputting interest rate: ${interest}%`);
      await interestInput.fill(interest.toString());
      AppLogger.log(`[Action] Inputting loan tenure: ${tenureYears} years`);
      await tenureInput.fill(tenureYears.toString());
      AppLogger.log(`[Action] Pressing Tab to trigger calculations`);
      await tenureInput.press('Tab');
    },

    async setStartMonth(monthYearString: string): Promise<string> {

      await calendarMonthPicker.click();
      AppLogger.log(`[Action] Inputting Month Year: ${monthYearString}`);
      await (await monthSelector(monthYearString)).click();
      AppLogger.log(`[Action] Press Tab`)
      await calendarMonthPicker.press('Tab');
      return await calendarMonthPicker.inputValue() 
    },

    async isBarChartVisible(): Promise<boolean> {
      return await barChartContainer.isVisible();
    },

    async getBarCount(): Promise<number> {
      await barElements.last().waitFor({ state: 'visible' })
      let barCount = await barElements.count()
      AppLogger.log(`[Action] Get bar element count  ${barCount/2}`)
      return barCount;
    },

    async hoverAndGetTooltipValue(index = 0): Promise<string> {
      if (await this.getBarCount() > index) {
        await barElements.nth(index).hover();
        await chartTooltipContents.waitFor({ state: 'visible'});
        let localData = await chartTooltipContents.textContent();
        const cleanData = localData ? localData.trim() : '';

        AppLogger.log(`[Action] Reading Tooltip content : ${cleanData}`);
        return cleanData;

      }
      throw new Error(`No bar found at index ${index}`);
    }
  };
};

export type PersonalLoanPage = ReturnType<typeof createPersonalLoanPage>;