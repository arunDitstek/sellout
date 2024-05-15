import { IConnectionManager } from "@sellout/service/.dist/interfaces";
import * as pb from "@sellout/models/.dist/sellout-proto";
import PbServiceProxy from "@sellout/service/.dist/PbServiceProxy";

export interface IServiceProxy {
  userService: pb.UserService;
  userProfileService: pb.UserProfileService;
  organizationService: pb.OrganizationService;
  orderService: pb.OrderService;
  stripeService: pb.StripeService;
  venueService: pb.VenueService;
  artistService: pb.ArtistService;
  eventService: pb.EventService;
  roleService: pb.RoleService;
  fileUploadService: pb.FileUploadService;
  webFlowService: pb.WebFlowService;
  feeService: pb.FeeService;
  seatingService: pb.SeatingService;
  seasonService: pb.SeasonService;
}

export function proxyProvider(conn: IConnectionManager): IServiceProxy {
  return {
    // User Service
    userService: new PbServiceProxy<pb.UserService>(
      conn,
      pb.UserService.name
    ).activate(pb.UserService),
    // User Profile Service
    userProfileService: new PbServiceProxy<pb.UserProfileService>(
      conn,
      pb.UserProfileService.name
    ).activate(pb.UserProfileService),
    // Organization Service
    organizationService: new PbServiceProxy<pb.OrganizationService>(
      conn,
      pb.OrganizationService.name
    ).activate(pb.OrganizationService),
    // Order Service
    orderService: new PbServiceProxy<pb.OrderService>(
      conn,
      pb.OrderService.name
    ).activate(pb.OrderService),
    // Stripe Service
    stripeService: new PbServiceProxy<pb.StripeService>(
      conn,
      pb.StripeService.name
    ).activate(pb.StripeService),
    // Venue Service
    venueService: new PbServiceProxy<pb.VenueService>(
      conn,
      pb.VenueService.name
    ).activate(pb.VenueService),
    // Artist Service
    artistService: new PbServiceProxy<pb.ArtistService>(
      conn,
      pb.ArtistService.name
    ).activate(pb.ArtistService),
    // Event Service
    eventService: new PbServiceProxy<pb.EventService>(
      conn,
      pb.EventService.name
    ).activate(pb.EventService),
    // Season Service
    seasonService: new PbServiceProxy<pb.SeasonService>(
      conn,
      pb.SeasonService.name
    ).activate(pb.SeasonService),
    // Role Service
    // File Upload
    roleService: new PbServiceProxy<pb.RoleService>(
      conn,
      pb.RoleService.name
    ).activate(pb.RoleService),
    // File Upload
    fileUploadService: new PbServiceProxy<pb.FileUploadService>(
      conn,
      pb.FileUploadService.name
    ).activate(pb.FileUploadService),
    // File Upload
    webFlowService: new PbServiceProxy<pb.WebFlowService>(
      conn,
      pb.WebFlowService.name
    ).activate(pb.WebFlowService),
    feeService: new PbServiceProxy<pb.FeeService>(
      conn,
      pb.FeeService.name
    ).activate(pb.FeeService),
    seatingService: new PbServiceProxy<pb.SeatingService>(
      conn,
      pb.SeatingService.name
    ).activate(pb.SeatingService)
  };
}
