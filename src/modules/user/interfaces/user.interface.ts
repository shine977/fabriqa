import { RoleEntity } from '../../role/entities/role.entity';
import { UserTypeEnum } from '../entities/user.entity';

export interface IUser {
  id: string;
  username: string;
  password: string;
  email?: string;
  phone?: string;
  avatar?: string;
  type?: UserTypeEnum;
  roles?: RoleEntity[];
  isActive?: boolean;
  refreshToken?: string;
  lastLoginAt?: Date;
  lastLoginIp?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  uid?: string;
  tenantId?: string;
}

export interface IUserQuery {
  id?: string;
  username?: string;
  isActive?: boolean;
  type?: UserTypeEnum;
  tenantId?: string;
}

export interface IPaginatedUserQuery extends IUserQuery {
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface ICreateUserDTO {
  username: string;
  password: string;
  email?: string;
  phone?: string;
  type?: UserTypeEnum;
  roleIds?: string[];
  tenantId?: string;
}

export interface IUpdateUserDTO {
  username?: string;
  password?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  type?: UserTypeEnum;
  roleIds?: string[];
  isActive?: boolean;
  tenantId?: string;
}

export interface IUserService {
  create(createUserDto: ICreateUserDTO): Promise<IUser>;
  findAll(query: IPaginatedUserQuery): Promise<{ items: IUser[]; total: number }>;
  findOne(query: IUserQuery): Promise<IUser>;
  findById(id: string): Promise<IUser>;
  findOneByUsername(username: string): Promise<IUser>;
  update(id: string, updateUserDto: IUpdateUserDTO): Promise<IUser>;
  remove(id: string): Promise<void>;
  validateUser(username: string, password: string): Promise<IUser | null>;
  updateRefreshToken(userId: string, refreshToken: string): Promise<void>;
  checkSuperAdminRole(userId: string): Promise<boolean>;
  getUserPermissions(userId: string): Promise<string[]>;
  getUserWithRoles(userId: string): Promise<IUser>;
  updateUserRoles(userId: string, roleIds: string[]): Promise<void>;
}
