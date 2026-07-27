import * as fs from 'fs';
import * as path from 'path';

export interface EnvConfig {
  envName: string;
  baseUrl: string;
  apiBaseUrl: string;
  headless: boolean;
  browser: string;
  cucumberDefaultTimeout: number;
  playwrightDefaultTimeout: number
  apiRetries: number,
  apiRetryDelay: number,
  enableApiTracer: boolean,
  statusCodesToRetry: number[]
}

const targetEnv = (process.env.ENV || 'dev').toLowerCase();
const jsonFilePath = path.resolve(__dirname, `env.${targetEnv}.json`);

let envData: Partial<EnvConfig> = {};

if (fs.existsSync(jsonFilePath)) {
  envData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
} else {
  console.warn(`[Config Warning] File "env.${targetEnv}.json" not found. Falling back to "env.dev.json".`);
  const fallbackPath = path.resolve(__dirname, 'env.dev.json');
  if (fs.existsSync(fallbackPath)) {
    envData = JSON.parse(fs.readFileSync(fallbackPath, 'utf-8'));
  }
}

const config: EnvConfig = {
  envName: envData.envName || targetEnv,
  baseUrl: process.env.BASE_URL || envData.baseUrl || 'https://emicalculator.net',
  apiBaseUrl: process.env.API_BASE_URL || envData.apiBaseUrl || 'https://jsonplaceholder.typicode.com',
  headless: process.env.HEADLESS !== undefined ? process.env.HEADLESS === 'true' : (envData.headless ?? true),
  browser: process.env.BROWSER || envData.browser || 'chromium',
  cucumberDefaultTimeout: process.env.CUCUMBER_DEFAULT_TIMEOUT ? parseInt(process.env.CUCUMBER_DEFAULT_TIMEOUT, 10) : (envData.cucumberDefaultTimeout || 60000),
  playwrightDefaultTimeout: process.env.PLAYWRIGHT_DEFAULT_TIMEOUT ? parseInt(process.env.PLAYWRIGHT_DEFAULT_TIMEOUT, 10) : (envData.playwrightDefaultTimeout || 60000),
  // Retry Configuration Mappings
  apiRetries: process.env.API_RETRIES ? parseInt(process.env.API_RETRIES, 10) : (envData.apiRetries ?? 3),
  apiRetryDelay: process.env.API_RETRY_DELAY ? parseInt(process.env.API_RETRY_DELAY, 10) : (envData.apiRetryDelay ?? 1000),
  statusCodesToRetry: process.env.STATUS_CODES_TO_RETRY 
  ? process.env.STATUS_CODES_TO_RETRY.split(',').map(Number) 
  : (envData.statusCodesToRetry ?? ([408, 429, 500, 502, 503, 504] as number[])),
  enableApiTracer: process.env.ENABLE_API_TRACER !== undefined ? process.env.ENABLE_API_TRACER === 'true' : (envData.enableApiTracer ?? true)
};

export default config;