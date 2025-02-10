import { MenuTypeEnum } from '@modules/menu/entities/menu.entity';

// src/module/auth/dto/login-response.dto.ts
export class LoginResponseDto {
  id: number;
  username: string;
  email?: string;
  accessToken: string;
  refreshToken: string;
  menus: MenuDto[];
  permissions: string[];
}

// src/module/auth/dto/menu.dto.ts
export class MenuDto {
  id: number;
  name: string;
  path?: string;
  component?: string;
  icon?: string;
  type: MenuTypeEnum;
  isVisible: boolean;
  isEnabled: boolean;
  orderNum: number;
  permission?: string;
  children?: MenuDto[];
}
