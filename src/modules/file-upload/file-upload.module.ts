import { Module } from '@nestjs/common';

import { FileUploadController } from './file-upload.controller';
import { OrdersService } from '../orders/orders.service';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    MulterModule.register({ storage: memoryStorage() }),
    OrdersModule
  ],
  controllers: [FileUploadController],


})
export class FileUploadModule { }
