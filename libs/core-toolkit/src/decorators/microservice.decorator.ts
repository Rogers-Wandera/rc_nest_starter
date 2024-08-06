import { SetMetadata } from '@nestjs/common';

export const MICRO_SERVICE_KEY = 'MICRO_SERVICE_KEY';
export const CheckMicroService = () => SetMetadata(MICRO_SERVICE_KEY, 'check');
