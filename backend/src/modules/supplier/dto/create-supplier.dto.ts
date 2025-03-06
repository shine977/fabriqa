import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsEmail, 
  IsUrl, 
  Length, 
  IsBoolean,
  IsObject,
  ValidateNested,
  IsArray,
  MaxLength,
  Matches,
  IsIn
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSupplierContactDto } from './create-supplier-contact.dto';

export class CreateSupplierDto {
  @ApiProperty({ description: '供应商编码', example: 'SUP-001' })
  @IsString()
  @Length(3, 50)
  @Matches(/^[A-Za-z0-9\-_]+$/, { message: '供应商编码只能包含字母、数字、连字符和下划线' })
  code: string;

  @ApiProperty({ description: '供应商名称', example: '上海电子科技有限公司' })
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiProperty({ description: '供应商类型', example: '电子元器件', required: false })
  @IsString()
  @IsOptional()
  @Length(1, 50)
  type?: string;

  @ApiProperty({ description: '供应商等级 (A/B/C/D)', example: 'A', required: false })
  @IsString()
  @IsOptional()
  @IsIn(['A', 'B', 'C', 'D'])
  rating?: string;

  @ApiProperty({ description: '税号', example: '91310000XXXXXXXX', required: false })
  @IsString()
  @IsOptional()
  @Length(1, 50)
  taxId?: string;

  @ApiProperty({ description: '电话', example: '021-12345678', required: false })
  @IsString()
  @IsOptional()
  @Length(1, 20)
  phone?: string;

  @ApiProperty({ description: '电子邮箱', example: 'contact@example.com', required: false })
  @IsEmail()
  @IsOptional()
  @Length(1, 100)
  email?: string;

  @ApiProperty({ description: '网站', example: 'https://www.example.com', required: false })
  @IsUrl()
  @IsOptional()
  @Length(1, 255)
  website?: string;

  @ApiProperty({ description: '国家', example: '中国', required: false })
  @IsString()
  @IsOptional()
  @Length(1, 50)
  country?: string;

  @ApiProperty({ description: '省/州', example: '上海', required: false })
  @IsString()
  @IsOptional()
  @Length(1, 50)
  province?: string;

  @ApiProperty({ description: '城市', example: '上海', required: false })
  @IsString()
  @IsOptional()
  @Length(1, 50)
  city?: string;

  @ApiProperty({ description: '详细地址', example: '浦东新区张江高科技园区', required: false })
  @IsString()
  @IsOptional()
  @Length(1, 255)
  address?: string;

  @ApiProperty({ description: '邮政编码', example: '200120', required: false })
  @IsString()
  @IsOptional()
  @Length(1, 20)
  postalCode?: string;

  @ApiProperty({ description: '付款条件', example: '30天账期', required: false })
  @IsString()
  @IsOptional()
  @Length(1, 100)
  paymentTerms?: string;

  @ApiProperty({ description: '付款方式', example: '银行转账', required: false })
  @IsString()
  @IsOptional()
  @Length(1, 50)
  paymentMethod?: string;

  @ApiProperty({ description: '货币', example: 'CNY', required: false })
  @IsString()
  @IsOptional()
  @Length(3, 3)
  currency?: string;

  @ApiProperty({ description: '银行名称', example: '中国工商银行', required: false })
  @IsString()
  @IsOptional()
  @Length(1, 100)
  bankName?: string;

  @ApiProperty({ description: '银行账号', example: '6222021234567890123', required: false })
  @IsString()
  @IsOptional()
  @Length(1, 50)
  bankAccount?: string;

  @ApiProperty({ description: '银行账户持有人', example: '上海电子科技有限公司', required: false })
  @IsString()
  @IsOptional()
  @Length(1, 100)
  bankAccountHolder?: string;

  @ApiProperty({ description: '是否活跃', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: '备注', example: '优质供应商，合作5年以上', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  remarks?: string;

  @ApiProperty({ description: '额外信息 (JSON)', required: false })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({ description: '联系人列表', type: [CreateSupplierContactDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSupplierContactDto)
  @IsOptional()
  contacts?: CreateSupplierContactDto[];

  @ApiProperty({ description: '租户ID', required: false })
  @IsString()
  @IsOptional()
  tenantId?: string;
}
