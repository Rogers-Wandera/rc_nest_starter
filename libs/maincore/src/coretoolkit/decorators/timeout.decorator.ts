import { SetMetadata } from '@nestjs/common';

export const TIMEOUT_METADATA_KEY = 'custom-timeout';
export const Timeout = (ms: number) => SetMetadata(TIMEOUT_METADATA_KEY, ms);

export const SkipTimeOut = () => SetMetadata(TIMEOUT_METADATA_KEY, null);
