export interface PricingTierDto {
  id: string;
  name: string;
  nameAr: string;
}

export interface PricingConfigDto {
  type: string;
  rates: any;
}

export interface PricingPayloadDto {
  tiers: PricingTierDto[];
  configs: PricingConfigDto[];
}

export interface PricingResponse {
  success: boolean;
  data: PricingPayloadDto;
}

