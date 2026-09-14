export interface PaymentMethodDto {
  id: string;
  name: string;
  nameAr: string;
  type: string;
  isCash: boolean;
  isProtected: boolean;
  isActive: boolean;
  displayOrder: number;
}

export interface CreatePaymentMethodDto {
  id?: string;
  name: string;
  nameAr: string;
  type?: string;
  isCash?: boolean;
  displayOrder?: number;
}

export interface UpdatePaymentMethodDto {
  name?: string;
  nameAr?: string;
  type?: string;
  isCash?: boolean;
  isActive?: boolean;
  displayOrder?: number;
}

export interface PaymentMethodResponse {
  success: boolean;
  data: PaymentMethodDto;
  message?: string;
}

export interface PaymentMethodListResponse {
  success: boolean;
  data: PaymentMethodDto[];
}

export interface PaymentRecordDto {
  id?: number;
  sessionId?: number;
  consoleId?: number;
  orderId?: string;
  paymentMethodId: string;
  paymentMethodName: string;
  amount: number;
  isCash: boolean;
  staff: string;
  notes?: string;
  createdAt?: Date | string;
}

export interface PaymentSplitDto {
  paymentMethodId: string;
  amount: number;
}

export interface ProcessPaymentDto {
  sessionId?: number;
  consoleId?: number;
  orderId?: string;
  payments: PaymentSplitDto[];
  staff?: string;
  notes?: string;
}

export interface PaymentListResponse {
  success: boolean;
  data: PaymentRecordDto[];
}

export interface PaymentSummaryDto {
  totalRevenue: number;
  cashTotal: number;
  nonCashTotal: number;
  breakdown: {
    paymentMethodId: string;
    name: string;
    nameAr: string;
    amount: number;
    count: number;
    isCash: boolean;
  }[];
}

export interface PaymentSummaryResponse {
  success: boolean;
  data: PaymentSummaryDto;
}
