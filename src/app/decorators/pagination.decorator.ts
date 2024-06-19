import { SetMetadata } from '@nestjs/common';

export const PAGINATE_KEY = 'paginate';
export const Paginate = () => SetMetadata(PAGINATE_KEY, 'paginate');
