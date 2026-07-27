import { expect } from '@playwright/test';

export interface ResponseValidationRules {
    [key: string]: (value: unknown) => void;
}

export function validateResponse(
    request: Record<string, unknown>,
    response: Record<string, unknown>,
    additionalRules: ResponseValidationRules = {},
): void {

    // Validate all request fields
    for (const [key, expectedValue] of Object.entries(request)) {
        expect(response).toHaveProperty(key);
        expect(response[key]).toEqual(expectedValue);
    }

    // Validate additional response fields
    for (const [key, validator] of Object.entries(additionalRules)) {
        expect(response).toHaveProperty(key);
        validator(response[key]);
    }
}