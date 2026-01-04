export interface TrustStat {
  /** Unique identifier */
  id: string;
  /** Display value (e.g., "15+", "98%", "10M+") */
  value: string;
  /** Label text */
  label: string;
  /** Optional numeric value for animation */
  numericValue: number | undefined;
  /** Optional suffix (e.g., "+", "%", "M+") */
  suffix: string | undefined;
}
