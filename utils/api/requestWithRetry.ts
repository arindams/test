import { APIRequestContext, APIResponse } from '@playwright/test';

export interface RetryOptions {
  retries: number;
  delay: number;
  statusCodesToRetry: number[];
  enableTracer: boolean;
}




/**
 * Pure retry utility driven strictly by its runtime options argument.
 */
export async function requestWithRetry(
  context: APIRequestContext,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  url: string,
  config: any = {},
  options: RetryOptions
): Promise<APIResponse> {

  const maxRetries = options.retries 
  const delayMs = options.delay 
  const retryStatuses = options.statusCodesToRetry 
  const tracerEnabled = options.enableTracer

  const requestMethod = method.toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'patch';

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (tracerEnabled) {
        console.log(`[TRACER] [ATTEMPT ${attempt}/${maxRetries}] Outgoing ${method} -> ${url}`);
        console.log(`[TRACER] Request Headers:`, JSON.stringify(config.headers ?? {}, null, 2));
        console.log(`[TRACER] Query Parameters:`, JSON.stringify(config.params ?? {}, null, 2));
        if (config.data) {
          console.log(`[TRACER] Request Body:`, typeof config.data === 'object' ? JSON.stringify(config.data, null, 2) : config.data);
        }
      }

      const response = await context[requestMethod](url, config);
      
      if (tracerEnabled) {
        console.log(`[TRACER] [ATTEMPT ${attempt}/${maxRetries}] Incoming Response from ${url}`);
        console.log(`[TRACER] Status: ${response.status()} ${response.statusText()}`);
        console.log(`[TRACER] Response Headers:`, JSON.stringify(response.headers(), null, 2));
        try {
          const body = await response.text();
          console.log(`[TRACER] Response Body:`, body);
        } catch {
          console.log(`[TRACER] Response Body: [Unparseable or Binary Data]`);
        }
      }

      if (response.ok() || !retryStatuses.includes(response.status()) || attempt === maxRetries) {
        if (!response.ok()) {
          console.error(`[API ERROR] Final attempt ${attempt} failed with status ${response.status()}. URL: ${url}`);
        }
        return response;
      }
      
      console.warn(`[API WARN] Attempt ${attempt}/${maxRetries} failed with status ${response.status()}. URL: ${url}. Retrying...`);
    } catch (error: any) {
      console.error(`[API EXCEPTION] Attempt ${attempt}/${maxRetries} caught exception: "${error.message}" for ${method} ${url}`);
      if (attempt === maxRetries) throw error;
    }

    if (attempt < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw new Error('Request failed unexpectedly without returning or throwing inside the loop.');
}