import { Global, Module } from '@nestjs/common';
import { UserContextService } from './user-context.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserContext } from './user-context';
import { UserEntity } from '@modules/user/entities/user.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [UserContext, UserContextService],
  exports: [UserContext, UserContextService],
})
export class UserContextModule {}
