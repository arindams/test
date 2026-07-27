import * as fs from 'fs';
import * as path from 'path';

export interface LoanProfile {
  amount: number;
  interestRate: number;
  tenureYears: number;
  startDate?: string;
}

export interface LoanTestData {
  homeLoan: Record<string, LoanProfile>;
  personalLoan: Record<string, LoanProfile>;
}

export const loadLoanFixtures = (): LoanTestData => {
  const filePath = path.resolve(__dirname, 'loanData.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(rawData);
};