import { Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { Repository } from 'typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
  ) {}
  async create(createCustomerDto: CreateCustomerDto) {
    console.log('createCustomerDto', createCustomerDto);
    const { raw } = await this.customerRepo.insert(createCustomerDto);
    if (raw.affectedRows) {
      return {
        status: 0,
      };
    }
  }

  async findAll() {
    return paginate<Customer>(this.customerRepo, {} as IPaginationOptions);
    // const [result, total] = await this.customerRepo.findAndCount({
    //   take: 10,
    //   skip: 0,
    // });

    // return {
    //   data: result,
    //   total,
    // };
  }

  findOne(id: number) {
    return `This action returns a #${id} customer`;
  }

  update(id: number, updateCustomerDto: UpdateCustomerDto) {
    return `This action updates a #${id} customer`;
  }

  remove(id: number) {
    return `This action removes a #${id} customer`;
  }
}
