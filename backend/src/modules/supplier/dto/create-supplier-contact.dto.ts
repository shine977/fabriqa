import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsEmail, 
  Length, 
  IsBoolean,
  MaxLength,
} from 'class-validator';

export class CreateSupplierContactDto {
  @ApiProperty({ description: '联系人姓名', example: '张三' })
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiProperty({ description: '职位', example: '采购经理', required: false })
  @IsString()
  @IsOptional()
  @Length(1, 100)
  position?: string;

  @ApiProperty({ description: '部门', example: '采购部', required: false })
  @IsString()
  @IsOptional()
  @Length(1, 100)
  department?: string;

  @ApiProperty({ description: '电话', example: '021-12345678', required: false })
  @IsString()
  @IsOptional()
  @Length(1, 20)
  phone?: string;

  @ApiProperty({ description: '手机', example: '13812345678', required: false })
  @IsString()
  @IsOptional()
  @Length(1, 20)
  mobile?: string;

  @ApiProperty({ description: '电子邮箱', example: 'zhangsan@example.com', required: false })
  @IsEmail()
  @IsOptional()
  @Length(1, 100)
  email?: string;

  @ApiProperty({ description: '是否主要联系人', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @ApiProperty({ description: '备注', example: '负责电子元器件采购', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  remarks?: string;
}
