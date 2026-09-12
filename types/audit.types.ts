export interface AuditEntryDto {
  id: string;
  timestamp: string;
  staff: string;
  actionType: string;
  details: string;
}

export interface AuditListResponse {
  success: boolean;
  data: AuditEntryDto[];
}

export interface AuditActionResponse {
  success: boolean;
  message: string;
}
