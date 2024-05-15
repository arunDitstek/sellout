import ITicketType from '../interfaces/ITicketType';
import ITicketTier from "../interfaces/ITicketTier";
import { TierStatusEnum } from "../enums/TierStatusEnum";
import * as Time from "@sellout/utils/.dist/time";

export default {
  isPastTier(ticketType: ITicketType, tier: ITicketTier): boolean {
    const now = Time.now();
    const endsAt = tier?.endsAt;

    if (tier.remainingQty === 0) return true;
    if (!endsAt || now <= endsAt) return false;
    else return true;
  },
  isInProgress(ticketType: ITicketType, tier: ITicketTier): boolean {
    //const now = Time.now();
    // const startsAt = tier?.startsAt;
    //const endsAt = tier?.endsAt;
    const remainingQty = tier.remainingQty;

    const tierIndex = ticketType?.tiers.map((tier) => tier._id).indexOf(tier._id);

    let previousTier: ITicketTier | null = null;

    if (tierIndex && tierIndex > -1) {
      const previousTierIndex = tierIndex - 1;
      previousTier = ticketType?.tiers[previousTierIndex] ?? null;
    }

    const previousTierIsPast = previousTier
      ? this.isPastTier(ticketType, previousTier)
      : true;

    const hasBegun = previousTierIsPast;
    const hasEnded = remainingQty <= 0 ;
    return hasBegun && !hasEnded;
  },
  isNotStarted(ticketType: ITicketType, tier: ITicketTier): boolean {
    const now = Time.now();
    // const startsAt = tier?.startsAt;
    const endsAt = tier?.endsAt;
    const remainingQty = tier.remainingQty;

    const tierIndex = ticketType?.tiers.map((tier) => tier._id).indexOf(tier._id);

    let previousTier: ITicketTier | null = null;

    if (tierIndex && tierIndex > -1) {
      const previousTierIndex = tierIndex - 1;
      previousTier = ticketType?.tiers[previousTierIndex] ?? null;
    }

    const previousTierIsPast = previousTier
      ? this.isPastTier(ticketType, previousTier)
      : true;

    const hasBegun = previousTierIsPast;
    const hasEnded = remainingQty <= 0 || (endsAt && endsAt < now);

    return !hasBegun && !hasEnded;
  },
  currentTier(ticketType: ITicketType): ITicketTier | null {
    const tiers = ticketType.tiers;
    const tier = tiers.find(tier => this.isInProgress(ticketType, tier));
    return tier || null;
  },
  tierStatus(
    ticketType: ITicketType,
    tier: ITicketTier
  ): TierStatusEnum {
    if (this.isInProgress(ticketType, tier)) return TierStatusEnum.InProgress;
    if (this.isPastTier(ticketType, tier)) return TierStatusEnum.Past;
    if (this.isNotStarted(ticketType, tier)) return TierStatusEnum.NotStarted;
    return TierStatusEnum.NotStarted;
  }
};
