export interface PricingQueryResponse {
  armRegionName: string;
  productName: string;
  meterName: string;
}

export interface SavingsPlan {
  term: string;
  retailPrice: string;
}