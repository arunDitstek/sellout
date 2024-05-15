import { IConnectionManager } from '@sellout/service/.dist/interfaces';
import * as pb from '@sellout/models/.dist/sellout-proto';
import PbServiceProxy from '@sellout/service/.dist/PbServiceProxy';
import PbBroadcastProxy from '@sellout/service/.dist/PbBroadcastProxy';

export interface IServiceProxy {
  broadcast: pb.Broadcast.Publisher;
  eventService: pb.EventService;
  venueService: pb.VenueService;
  artistService: pb.ArtistService;
  organizationService: pb.OrganizationService;
  emailService: pb.EmailService;
}

export function proxyProvider(conn: IConnectionManager): IServiceProxy {
  return {
    broadcast: new PbBroadcastProxy(conn).activate(),
    organizationService: new PbServiceProxy<pb.OrganizationService>(conn, pb.OrganizationService.name)
      .activate(pb.OrganizationService),
    eventService: new PbServiceProxy<pb.EventService>(conn, pb.EventService.name)
      .activate(pb.EventService),
    venueService: new PbServiceProxy<pb.VenueService>(conn, pb.VenueService.name)
      .activate(pb.VenueService),
    artistService: new PbServiceProxy<pb.ArtistService>(conn, pb.ArtistService.name)
      .activate(pb.ArtistService),
    emailService: new PbServiceProxy<pb.EmailService>(conn, pb.EmailService.name)
      .activate(pb.EmailService),
  };
}
