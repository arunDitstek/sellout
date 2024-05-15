import { IConnectionManager } from '@sellout/service/.dist/interfaces';
import * as pb from '@sellout/models/.dist/sellout-proto';
import PbServiceProxy from '@sellout/service/.dist/PbServiceProxy';
import PbBroadcastProxy from '@sellout/service/.dist/PbBroadcastProxy';

export interface IServiceProxy {
  broadcast: pb.Broadcast.Publisher;
  orderService: pb.OrderService;
  seasonService: pb.SeasonService;
  userService: pb.UserService;
  userProfileService: pb.UserProfileService;
  organizationService: pb.OrganizationService;
  eventService: pb.EventService;
  venueService: pb.VenueService;
  artistService: pb.ArtistService;
  feeService: pb.feeService;
  stripeService: pb.StripeService;
  seatingService: pb.SeatingService;
  emailService: pb.EmailService;
  plivoService: pb.PlivoService;
  fileUploadService: pb.FileUploadService;
  taskService: pb.TaskService;
}

export function proxyProvider(conn: IConnectionManager): IServiceProxy {
  return {
    broadcast: new PbBroadcastProxy(conn).activate(),
    orderService: new PbServiceProxy<pb.OrderService>(conn, pb.OrderService.name)
    .activate(pb.OrderService),
    seasonService: new PbServiceProxy<pb.SeasonService>(conn, pb.SeasonService.name)
      .activate(pb.SeasonService),
    userService: new PbServiceProxy<pb.UserService>(conn, pb.UserService.name)
      .activate(pb.UserService),
    userProfileService: new PbServiceProxy<pb.UserProfileService>(conn, pb.UserProfileService.name)
      .activate(pb.UserProfileService),
    organizationService: new PbServiceProxy<pb.OrganizationService>(conn, pb.OrganizationService.name)
      .activate(pb.OrganizationService),
    eventService: new PbServiceProxy<pb.EventService>(conn, pb.EventService.name)
      .activate(pb.EventService),
    venueService: new PbServiceProxy<pb.VenueService>(conn, pb.VenueService.name)
      .activate(pb.VenueService),
    artistService: new PbServiceProxy<pb.ArtistService>(conn, pb.ArtistService.name)
      .activate(pb.ArtistService),
    feeService: new PbServiceProxy<pb.FeeService>(conn, pb.FeeService.name)
      .activate(pb.FeeService),
    stripeService: new PbServiceProxy<pb.StripeService>(conn, pb.StripeService.name)
      .activate(pb.StripeService),
    seatingService: new PbServiceProxy<pb.SeatingService>(conn, pb.SeatingService.name)
      .activate(pb.SeatingService),
    emailService: new PbServiceProxy<pb.EmailService>(conn, pb.EmailService.name)
      .activate(pb.EmailService),
    plivoService: new PbServiceProxy<pb.PlivoService>(conn, pb.PlivoService.name)
      .activate(pb.PlivoService),
    fileUploadService: new PbServiceProxy<pb.FileUploadService>(conn, pb.FileUploadService.name)
      .activate(pb.FileUploadService),
    taskService: new PbServiceProxy<pb.TaskService>(conn, pb.TaskService.name)
      .activate(pb.TaskService),
  };
}
