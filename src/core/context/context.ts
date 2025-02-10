import { UserEntity } from '@modules/user/entities/user.entity';
import { RequestUser } from 'src/types/user.interface';

export abstract class Context {
  protected readonly instanceId: string;
  protected user: UserEntity;

  constructor() {
    this.instanceId = `ctx_${Math.random().toString(36).substring(2, 9)}`;
  }

  abstract setUser(user: UserEntity): void;
  abstract getUser(): UserEntity | null;

  getId(): string {
    return this.instanceId;
  }

  hasUser(): boolean {
    return this.user !== null;
  }
}
