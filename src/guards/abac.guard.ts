// src/auth/abac.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PolicyService } from 'src/service/policyService';


@Injectable()
export class AbacGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private policyService: PolicyService
    ) { }

    canActivate(context: ExecutionContext): boolean {
        const resource = this.reflector.get<string>('resource', context.getHandler());
        const action = this.reflector.get<string>('action', context.getHandler());
        const request = context.switchToHttp().getRequest();
        const user = request.user;  // Assume user object includes roles and attributes like department

        const policy = this.policyService.getPolicy(resource, action);
        if (!policy) {
            return false;  // No policy found, access denied
        }

        return this.evaluatePolicy(policy, user);
    }

    private evaluatePolicy(policy, user): boolean {
        return Object.entries(policy.conditions).every(([key, value]) => user[key] === value);
    }
}
