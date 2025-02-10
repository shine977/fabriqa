import { Command, CommandRunner } from 'nest-commander';
import { Injectable } from '@nestjs/common';
import { PermissionInitService } from '../permission.init.service';

@Injectable()
@Command({
    name: 'init:permissions',
    description: '初始化系统权限'
})
export class InitPermissionsCommand extends CommandRunner {
    constructor(private readonly permissionInitService: PermissionInitService) {
        super();
    }

    async run(): Promise<void> {
        try {
            await this.permissionInitService.initializePermissions(true);
            console.log('权限初始化成功！');
        } catch (error) {
            console.error('权限初始化失败：', error);
            process.exit(1);
        }
    }
}