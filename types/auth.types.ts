export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface UserPublicDto {
  id: number;
  username: string;
  name: string;
  role: string;
  createdAt?: Date | string;
}

export interface LoginResponseDto {
  success: boolean;
  token: string;
  user: UserPublicDto;
}

export interface ChangePasswordDto {
  username: string;
  currentPassword?: string;
  newPassword: string;
}

export interface AccountDto {
  id?: number;
  username: string;
  name?: string;
  role?: string;
  password?: string;
}

export interface UserListResponse {
  success: boolean;
  data: UserPublicDto[];
}

export interface UserActionResponse {
  success: boolean;
  message: string;
}

export interface CurrentUserResponse {
  success: boolean;
  user: UserPublicDto;
}
