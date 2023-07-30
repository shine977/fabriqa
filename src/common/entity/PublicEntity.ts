import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as dayjs from 'dayjs';
export class PublicEntity {
  @PrimaryGeneratedColumn('increment', { unsigned: true })
  id: number;
  @CreateDateColumn({
    transformer: {
      to(value) {
        console.log('CreateDateColumn transformer to', value);
        console.log(dayjs().format('YYYY-MM-DD HH:mm:ss'));
        return dayjs().format('YYYY-MM-DD HH:mm:ss');
      },
      from: (date) => date,
    },
  })
  created_at: Date;
  @UpdateDateColumn({
    transformer: {
      to(value) {
        console.log('UpdateDateColumn transformer to', value);
        console.log(dayjs().format('YYYY-MM-DD HH:mm:ss'));
        return dayjs().format('YYYY-MM-DD HH:mm:ss');
      },
      from(value) {
        return value;
      },
    },
  })
  updated_at: Date;
  @DeleteDateColumn({
    transformer: {
      to(value) {
        console.log('DeleteDateColumn transformer to', value);
        console.log(dayjs().format('YYYY-MM-DD HH:mm:ss'));
        return dayjs().format('YYYY-MM-DD HH:mm:ss');
      },
      from(value) {
        return value;
      },
    },
  })
  deleted_at: Date;
}
