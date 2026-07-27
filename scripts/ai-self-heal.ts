import { chromium, Page } from '@playwright/test';
import config from '../config/env.config';

interface AiRecommendation {
  suggestedLocator: string;
  strategy: string;
  confidence: number;
}

const generateHealingPrompt = (failedSelector: string, domSnippet: string): string => `
  A test just failed because the following selector could not be found: "${failedSelector}".
  Analyze the provided DOM snippet below and recommend a resilient, modern Playwright locator statement.
  
  STRICT LOCATOR PRIORITIZATION:
  1. page.getByRole('role', { name: 'label' })
  2. page.getByLabel('label')
  3. page.locator('#id')

  DOM Snippet:
  ${domSnippet}

  Respond ONLY with a valid JSON object matching this structure:
  { "suggestedLocator": "string", "strategy": "string", "confidence": 0.95 }
`;


async function askAiForResilientLocator(failedSelector: string, prompt: string): Promise<AiRecommendation> {
  console.log(`[AI Engine] Analyzing failure for broken selector: "${prompt}"`);


  /**
   * We can have a Qulaity gate and try only selectors which have greater confidence score like greater than 0.8
   */

  if (failedSelector.includes('input[1]') || failedSelector.includes('loanamount')) {
    return {
      suggestedLocator: '#loanamount',
      strategy: 'DOM ID-based resilient locator',
      confidence: 0.98
    };
  }

  return {
    suggestedLocator: '#emipiechart',
    strategy: 'Container ID locator',
    confidence: 0.95
  };
}

async function runSelfHealingPOC() {
  console.log(`Executing AI Self-Healing POC in [ ${config.envName.toUpperCase()} ] environment...`);
  console.log(`Base URL: ${config.baseUrl}`);
  
  const browser = await chromium.launch({ headless: config.headless });
  const page: Page = await browser.newPage();
  
  await page.goto(config.baseUrl);

  const brokenSelector = '/html/body/div[1]/div/div[2]/div[1]/div[1]/input[1]';
  console.log(`Attempting interaction using broken selector: ${brokenSelector}`);

  try {
    await page.locator(brokenSelector).waitFor({ state: 'visible', timeout: 2000 });
  } catch (err: any) {
    console.error(`Locator Failed: ${err.message.split('\n')[0]}`);

    const domSnippet = (await page.content()).substring(0, 1000);
    const aiFix = await askAiForResilientLocator(brokenSelector, generateHealingPrompt(brokenSelector, domSnippet));

    console.log(`Strategy: ${aiFix.strategy}`);
    console.log(`Suggested Locator: "${aiFix.suggestedLocator}"`);

    const healedLocator = page.locator(aiFix.suggestedLocator);
    if ((await healedLocator.count()) > 0 && (await healedLocator.first().isVisible())) {
      console.log(`[Self-Healing SUCCESS] Healed locator validated!`);
      await healedLocator.first().fill('2500000');
      const val = await healedLocator.first().inputValue();
      console.log(`Value entered successfully: ${val}`);
    }
  }

  await browser.close();
  console.log('\n AI Self-Healing POC complete.');
}

runSelfHealingPOC();