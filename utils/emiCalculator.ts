export interface EmiCalculationParams {
  principal: number;
  annualInterestRate: number;
  tenureYears: number;
}

export const calculateEMI = ({ principal, annualInterestRate, tenureYears }: EmiCalculationParams): number => {
  if (principal <= 0 || annualInterestRate <= 0 || tenureYears <= 0) return 0;

  const P = principal;
  const r = annualInterestRate / (12 * 100);
  const n = tenureYears * 12;

  const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return Math.round(emi);
};