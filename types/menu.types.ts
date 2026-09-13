export interface MenuItemDto {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  price: number;
  costPrice?: number;
  stock?: number;
  lowStockThreshold?: number;
  trackStock?: boolean;
}

export interface CategoryDto {
  id: string;
  name: string;
  nameAr: string;
}

export interface MenuItemListResponse {
  success: boolean;
  data: MenuItemDto[];
}

export interface MenuItemResponse {
  success: boolean;
  data: MenuItemDto;
}

export interface CategoryListResponse {
  success: boolean;
  data: CategoryDto[];
}

export interface CategoryResponse {
  success: boolean;
  data: CategoryDto;
}

export interface MenuActionResponse {
  success: boolean;
  message: string;
}
