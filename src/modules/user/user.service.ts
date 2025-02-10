import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UserEntity } from './entities/user.entity';
import { RoleEntity } from '../role/entities/role.entity';
import { ICreateUserDTO, IUpdateUserDTO, IUserQuery, IPaginatedUserQuery } from './interfaces/user.interface';
import { encryptAESData } from 'src/common/utils/crypto';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

  async create(createUserDto: ICreateUserDTO): Promise<UserEntity> {
    const existingUser = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const user = this.userRepository.create({
      ...createUserDto,
      password: encryptAESData(createUserDto.password),
    });

    if (createUserDto.roleIds?.length) {
      const roles = await this.roleRepository.findByIds(createUserDto.roleIds);
      user.roles = roles;
    }

    return this.userRepository.save(user);
  }

  async findAll(query: IPaginatedUserQuery): Promise<{ items: UserEntity[]; total: number }> {
    const { page = 1, limit = 10, orderBy = 'createdAt', order = 'DESC', ...where } = query;
    const [items, total] = await this.userRepository.findAndCount({
      where,
      order: { [orderBy]: order },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total };
  }

  async findOne(query: IUserQuery): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: query });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
  async findOneById(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findById(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findOneByUsername(username: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, updateUserDto: IUpdateUserDTO): Promise<UserEntity> {
    const user = await this.findById(id);

    if (updateUserDto.password) {
      updateUserDto.password = encryptAESData(updateUserDto.password);
    }

    if (updateUserDto.roleIds) {
      const roles = await this.roleRepository.findByIds(updateUserDto.roleIds);
      user.roles = roles;
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.userRepository.remove(user);
  }

  async validateUser(username: string, password: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['roles'],
    });

    if (user && user.password === encryptAESData(password)) {
      return user;
    }
    return null;
  }

  async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await this.userRepository.update(userId, { refreshToken });
  }

  async checkSuperAdminRole(userId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    return user?.roles?.some(role => role.name === 'super-admin') ?? false;
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const permissions = new Set<string>();
    user.roles.forEach(role => {
      role.permissions.forEach(permission => {
        permissions.add(permission.name);
      });
    });

    return Array.from(permissions);
  }

  async getUserWithRoles(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUserRoles(userId: string, roleIds: string[]): Promise<void> {
    const user = await this.findById(userId);
    const roles = await this.roleRepository.findByIds(roleIds);
    user.roles = roles;
    await this.userRepository.save(user);
  }
}
