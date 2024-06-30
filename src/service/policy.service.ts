import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PolicyEntity } from 'src/module/policy/entities/policy.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PolicyService {
    constructor(@InjectRepository(PolicyEntity) private readonly policyRepository: Repository<PolicyEntity>) { }
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
    async checkPermission(resourceType: string, department: string, permission: string): Promise<boolean> {
        const policy = await this.policyRepository.findOne({
            where: { resourceType, department, permission }
        });
        return !!policy;
    }
}