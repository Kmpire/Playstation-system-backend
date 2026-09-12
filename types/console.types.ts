export interface PriceSegmentDto {
  playerType: string;
  startElapsedMs: number;
  ratePerHour: number;
}

export interface TabItemDto {
  id: string;
  name: string;
  nameAr?: string;
  price: number;
  qty: number;
}

export interface SessionDto {
  id?: number;
  mode: "prepaid" | "postpaid";
  playerType: "single" | "multi";
  startTime: number;
  pausedAt?: number | null;
  totalPausedMs: number;
  targetDurationMin?: number | null;
  priceSegments: PriceSegmentDto[];
  tab: TabItemDto[];
}

export interface ConsoleDto {
  id: number;
  name: string;
  type: string;
  status: string;
  dailyTotal: number;
  session?: SessionDto | null;
}

export interface ConsoleResponse {
  success: boolean;
  data: ConsoleDto;
}

export interface ConsoleListResponse {
  success: boolean;
  data: ConsoleDto[];
}

export interface ConsoleActionResponse {
  success: boolean;
  message: string;
}
