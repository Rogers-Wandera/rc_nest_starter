import { SetMetadata } from '@nestjs/common';

export type UserEvent = {};

export const EVENT_KEY = 'EVENT_KEY';

export const EventSaver = (event: UserEvent) => SetMetadata(EVENT_KEY, event);
