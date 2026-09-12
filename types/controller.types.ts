export interface GamepadDto {
  id: string;
  number: string;
  assignedTo?: number | null;
  status: string;
}

export interface MaintenanceRecordDto {
  id: string;
  date: string;
  targetType: string;
  targetId: string;
  targetLabel: string;
  issue: string;
  cost: number;
  resolvedBy: string;
}

export interface GamepadListResponse {
  success: boolean;
  data: GamepadDto[];
}

export interface GamepadResponse {
  success: boolean;
  data: GamepadDto;
}

export interface MaintenanceListResponse {
  success: boolean;
  data: MaintenanceRecordDto[];
}

export interface MaintenanceResponse {
  success: boolean;
  data: MaintenanceRecordDto;
}

export interface ControllerActionResponse {
  success: boolean;
  message: string;
}
