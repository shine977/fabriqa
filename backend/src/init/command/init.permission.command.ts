import { Command, CommandRunner } from 'nest-commander';
import { Injectable } from '@nestjs/common';
import { InitPermissionService } from '../init.permission.service';

@Injectable()
@Command({
  name: 'init:permissions',
  description: '初始化系统权限',
})
export class InitPermissionsCommand extends CommandRunner {
  constructor(private readonly permissionInitService: InitPermissionService) {
    super();
  }

  async run(): Promise<void> {
    try {
      await this.permissionInitService.syncPermissions();
      console.log('权限初始化成功！');
    } catch (error) {
      console.error('权限初始化失败：', error);
      process.exit(1);
    }
  }
}
