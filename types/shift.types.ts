export interface ShiftReportDto {
  id: string;
  date: string;
  staff: string;
  countedCash: number;
  expectedCash: number;
  variance: number;
  notes?: string;
}

export interface ShiftListResponse {
  success: boolean;
  data: ShiftReportDto[];
}

export interface ShiftActionResponse {
  success: boolean;
  message: string;
}
