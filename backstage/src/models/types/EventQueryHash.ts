import { EventQueryEnum } from '../enums/EventQueryEnum';
import IEventQuery from '@sellout/models/.dist/interfaces/IEventQuery';

export type EventQueryHash = {
  [key in EventQueryEnum]: IEventQuery;
}
