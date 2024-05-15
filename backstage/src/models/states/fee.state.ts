import IFee, { FeeTypeEnum, FeeAppliedToEnum, FeeAppliedByEnum } from '@sellout/models/.dist/interfaces/IFee';
import shortid from 'shortid';

export default function feeState(
  _id: string = shortid.generate(),
  eventId?: string,
  seasonId?:string,
  name: string = 'New Fee',
  type: FeeTypeEnum = FeeTypeEnum.Flat,
  value: number = 100,
): IFee {
  return {
    _id: _id,
    name: name,
    eventId: eventId,
    seasonId: seasonId,
    type: type,
    value: value,
    appliedTo: FeeAppliedToEnum.Order,
    appliedBy: FeeAppliedByEnum.Organization,
    filters: [],
    disabled: false,
    isApplyPlatformFee:false
  };
}
