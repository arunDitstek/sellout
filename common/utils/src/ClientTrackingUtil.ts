import * as GoogleUtil from './GoogleUtil';
import * as FacebookUtil from './FacebookUtil';

export enum ClientTrackingEventTypes {
  Purchase = 'Purchase',
};

export interface IClientTrackingIds {
  googleAnalyticsId?: string;
  facebookPixelId?: string;
}

export function initialize(clientTrackingIds: IClientTrackingIds) {
  GoogleUtil.initialize(clientTrackingIds.googleAnalyticsId);
  FacebookUtil.initialize(clientTrackingIds.facebookPixelId);
}

export function track(type: ClientTrackingEventTypes, params: any) {
  switch (type) {
    case ClientTrackingEventTypes.Purchase:
      return trackPurchase(params);
    default:
      return null;
  }
}

function trackPurchase({
  order,
  orderTotal,
  channel,
  currency = 'USD',
}): void {
  GoogleUtil.track('event', 'purchase', {
    transaction_id: order._id,
    value: orderTotal / 100,
    affiliation: channel,
    currency,
  });

  FacebookUtil.track('track', 'Purchase', {
    value: orderTotal / 100,
    currency,
  });
}
