export interface CompanySocialDto {
  label: string;
  icon: string;
  handle: string;
}

export interface CompanyInfoDto {
  id?: number;
  name: string;
  nameAr: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  addressAr?: string | null;
  socials?: CompanySocialDto[];
}

export interface CompanyResponse {
  success: boolean;
  data: CompanyInfoDto;
}
