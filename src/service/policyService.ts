import { Injectable } from '@nestjs/common';

@Injectable()
export class PolicyService {
    private policies = [
        {
            id: 1,
            entity: 'document',
            action: 'read',
            conditions: {
                role: 'admin',
                department: 'IT'
            }
        }
    ];

    getPolicy(entity: string, action: string) {
        return this.policies.find(policy => policy.entity === entity && policy.action === action);
    }
}