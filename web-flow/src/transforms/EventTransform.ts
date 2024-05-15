import { EventPromotionTypeEnum } from '@sellout/models/.dist/interfaces/IEventPromotion';
import EventUtil from '@sellout/models/.dist/utils/EventUtil';
import * as Time from '@sellout/utils/.dist/time';
import * as HtmlTransform from './HtmlTransform';

export function transform(
  event: any,
  organizationWebFlowId: string = null,
  webFlowVenueId: string = null,
  headliningPerformerName: string = null,
  headliningPerformWebFlowId: string[] = null,
  openingPerformerWebFlowIds: string[] = null,
  slug: string = null,
  draft: boolean = true,
  timezone: string,
): any {
  const { performances: [performance] } = event;
  const { schedule: performanceSchedule, videoLink, songLink = '' } = performance;
  const { schedule: { announceAt, ticketsAt } } = event;
  let { ticketTypes } = event;

  ticketTypes = ticketTypes.filter(ticketType => ticketType.remainingQty > 0);

  const remainingQty = ticketTypes.reduce((cur, next) => {
    return cur + next.remainingQty;
  },0);

  const prices = ticketTypes.reduce((cur, next) => {
    const prices = next.tiers.reduce((cur, tier) => {
      cur.push(tier.price);
      return cur;
    },[]);

    return cur.concat(prices);
  },[]);

  const minPrice = Math.min(...prices) / 100;

  const webFlowEvent: any = {
    _archived: false,
    _draft: draft,
    'remaining-ticket-quantity': remainingQty,
    'lowest-price': minPrice,
    'event-description': event.description,
    age: event.age,
    'sellout-id': event._id.toString(),
    name: event.name,
    subtitle: event.subtitle,
    'poster-image': event.posterImageUrl,
  };

  if (organizationWebFlowId) {
    webFlowEvent['organization'] = organizationWebFlowId;
  }

  if (webFlowVenueId) {
    webFlowEvent['venue'] = webFlowVenueId;
  }

  if (headliningPerformerName) {
    webFlowEvent['headlining-performer-name'] = headliningPerformerName;
  }

  if (headliningPerformWebFlowId) {
    webFlowEvent['headlining-performers'] = headliningPerformWebFlowId;
  }

  if (openingPerformerWebFlowIds) {
    webFlowEvent['opening-performers'] = openingPerformerWebFlowIds;
  }

  if (Time.date(performanceSchedule.startsAt)) {
    const startsAt = Time.date(performanceSchedule.startsAt);
    webFlowEvent['performance-date-time'] = startsAt;
    webFlowEvent['performance-date-number'] = startsAt.getTime();
  }

  if (Time.date(performanceSchedule.doorsAt)) {
    webFlowEvent['door-time'] = Time.date(performanceSchedule.doorsAt);
  }

  if (Time.date(announceAt)) {
    const annouceAt = Time.date(announceAt);
    webFlowEvent['announcement-date'] = annouceAt;
    webFlowEvent['announcement-date-number'] = annouceAt.getTime();
  }

  if (Time.date(ticketsAt)) {
    webFlowEvent['on-sale-date'] = Time.date(ticketsAt);
  }

  if (HtmlTransform.transform(event.description)) {
    webFlowEvent['plain-text-description'] = HtmlTransform.transform(event.description);
  }

  if (videoLink.split('https://www.youtube.com/watch?v=')[1]) {
    webFlowEvent['youtube-id'] =  videoLink.split('https://www.youtube.com/watch?v=')[1];
  }
  
  if (videoLink.split('https://www.youtube.com/playlist')[1]) {
    webFlowEvent['youtube-id'] = 'videoseries' + videoLink.split('https://www.youtube.com/playlist')[1]; 
  }

  if (songLink.split('https://open.spotify.com/')[1]) {
    webFlowEvent['spotify-link'] =  songLink.split('https://open.spotify.com/')[1];
  }

  if (slug) {
    webFlowEvent['slug'] = slug;
  }

  if (EventUtil.hasBeenAnnounced(event)) {
    const hasActivePreSalePromotions = EventUtil.activePromotions(event, EventPromotionTypeEnum.PreSale).length > 0;
    if (hasActivePreSalePromotions) {
      webFlowEvent['event-status'] = `On Sale ${Time.format(ticketsAt, 'ddd, MMM DD | h:mmA', timezone)}`;
      webFlowEvent['button-text'] = 'Get Tickets';
    } else {
      webFlowEvent['event-status'] = `On Sale ${Time.format(ticketsAt, 'ddd, MMM DD | h:mmA', timezone)}`;
      webFlowEvent['button-text'] = '';
    }
  }

  if (EventUtil.isOnSale(event)) {
    webFlowEvent['event-status'] = 'On Sale';
    webFlowEvent['button-text'] = 'Get Tickets';
  }

  if (EventUtil.saleHasEnded(event)) {
    webFlowEvent['event-status'] = 'Sales have ended';
    webFlowEvent['button-text'] = 'View Event';
  }

  if (remainingQty <= 0) {
    webFlowEvent['event-status'] = 'Sold Out';
    webFlowEvent['button-text'] = 'View Event';
  }

  return webFlowEvent;
}
