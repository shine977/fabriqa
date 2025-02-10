import { UserEntity } from '../entities/user.entity';

export interface IUserRepository {
  findOneByUsername(username: string): Promise<UserEntity>;
  findById(id: string): Promise<UserEntity>;
  updateRefreshToken(userId: string, token: string): Promise<void>;
}