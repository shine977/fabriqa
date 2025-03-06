import { registerAs } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';
import { join } from 'path';

export const databaseConfig = registerAs('database', () => ({
  type: 'postgres' as const,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '12345678',
  database: process.env.DB_DATABASE || 'mes',
  synchronize: process.env.NODE_ENV === 'development', // 只在开发环境启用
  // dropSchema: process.env.NODE_ENV === 'development', // 开发环境自动删除所有表
  autoLoadEntities: true,
  entities: [join(__dirname, '../../**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '../../database/migrations/*{.ts,.js}')],
  migrationsTableName: 'migrations_typeorm',
  migrationsRun: process.env.NODE_ENV === 'production',
  ssl:
    process.env.DB_SSL === 'true'
      ? {
          rejectUnauthorized: false,
        }
      : false,
  logger: 'advanced-console',
  schema: process.env.DB_SCHEMA || 'public',
  poolSize: parseInt(process.env.DB_POOL_SIZE, 10) || 10,
  extra: {
    max: parseInt(process.env.DB_POOL_MAX, 10) || 20,
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT, 10) || 10000,
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT, 10) || 5000,
    query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT, 10) || 5000,
    statement_timeout: parseInt(process.env.DB_QUERY_TIMEOUT, 10) || 5000,
    application_name: 'injecting_admin',
  },

  timezone: 'Asia/Shanghai',
  dateStrings: true,
  // PostgreSQL 特定配置
  options: {
    // 设置会话级别的时间格式
    useUTC: false,
    // 设置时区为上海
    timezone: 'Asia/Shanghai',
  },
  // 连接后执行的 SQL
  connectAfterQueries: [
    "SET timezone='Asia/Shanghai'",
    "SET datestyle = 'ISO, YMD'",
    "SET intervalstyle = 'postgres'",
    "SET TIME ZONE 'Asia/Shanghai'",
    // 设置 timestamp 输出格式
    // "SET SESSION TIME ZONE 'Asia/Shanghai'",
    // "ALTER DATABASE mes SET timezone TO 'Asia/Shanghai'",
    // "SET SESSION DateStyle = 'ISO, YMD'",
  ],
  retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS, 10) || 3,
  retryDelay: parseInt(process.env.DB_RETRY_DELAY, 10) || 3000,
  keepConnectionAlive: true,
}));

export const getTypeOrmConfig = (config: Record<string, any>): DataSourceOptions => {
  return {
    type: 'postgres',
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password,
    database: config.database,
    synchronize: config.synchronize,
    entities: config.entities,
    migrations: config.migrations,
    migrationsTableName: config.migrationsTableName,
    migrationsRun: config.migrationsRun,
    ssl: config.ssl,
    logging: config.logging,
    logger: config.logger,
    schema: config.schema,
    poolSize: config.poolSize,
    extra: config.extra,
  };
};
