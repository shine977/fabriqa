import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// @Injectable()
// export class RefreshTokenGuard extends AuthGuard('jwt-refresh') {
//     async canActivate(context: ExecutionContext): Promise<boolean> {
//       const req = context.switchToHttp().getRequest();
//       console.log('req.user', req.user);
//       return true;
//     }
// }

@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt-refresh') {}
