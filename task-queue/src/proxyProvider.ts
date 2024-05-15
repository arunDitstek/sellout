import { IConnectionManager } from '@sellout/service/.dist/interfaces';
import * as pb from '@sellout/models/.dist/sellout-proto';
import PbServiceProxy from '@sellout/service/.dist/PbServiceProxy';

export interface IServiceProxy {
  orderService: pb.OrderService;
  eventService: pb.EventService;
  webFlowService: pb.WebFlowService;
  emailService: pb.emailService;
  fileUploadService: pb.FileUploadService;
  venueService: pb.VenueService;
  organizationService : pb.OrganizationService;
  feeService: pb.FeeService;
}


export function proxyProvider(conn: IConnectionManager): IServiceProxy {
  return {
    orderService: new PbServiceProxy<pb.OrderService>(conn, pb.OrderService.name)
      .activate(pb.OrderService),
    eventService: new PbServiceProxy<pb.EventService>(conn, pb.EventService.name)
      .activate(pb.EventService),
      emailService: new PbServiceProxy<pb.EmailService>(conn, pb.EmailService.name)
      .activate(pb.EmailService),
    webFlowService: new PbServiceProxy<pb.WebFlowService>(conn, pb.WebFlowService.name)
      .activate(pb.WebFlowService),
    fileUploadService: new PbServiceProxy<pb.FileUploadService>(conn, pb.FileUploadService.name)
    .activate(pb.FileUploadService),
    venueService: new PbServiceProxy<pb.VenueService>(conn, pb.VenueService.name)
    .activate(pb.VenueService),
    organizationService: new PbServiceProxy<pb.OrganizationService>(conn, pb.OrganizationService.name)
    .activate(pb.OrganizationService),
    feeService: new PbServiceProxy<pb.FeeService>(conn, pb.FeeService.name)
    .activate(pb.FeeService),
  };
}
