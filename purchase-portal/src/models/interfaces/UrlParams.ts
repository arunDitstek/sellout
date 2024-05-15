import { EPurchasePortalModes } from '@sellout/models/.dist/enums/EPurchasePortalModes';

export default interface UrlParams {
  eventId?: string;
  mode?: EPurchasePortalModes;
  complimentary?: string;
  seasonId?:string;
  memberId?:string;
}
