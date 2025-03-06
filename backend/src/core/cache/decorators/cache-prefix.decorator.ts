import { SetMetadata } from '@nestjs/common';
import { CACHE_PREFIX_METADATA } from '../cache.constants';

export const CachePrefix = (prefix: string) => SetMetadata(CACHE_PREFIX_METADATA, prefix);
