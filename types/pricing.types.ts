export interface PricingConfigDto {
  type: string;
  singleRate: number;
  multiRate: number;
}

export interface PricingListResponse {
  success: boolean;
  data: PricingConfigDto[];
}
