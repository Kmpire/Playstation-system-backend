export interface SettingValueDto {
  value: string;
}

export interface SettingResponse {
  success: boolean;
  value: string | null;
}

export interface SettingActionResponse {
  success: boolean;
  message: string;
}
