import { IConnectionManager } from '@sellout/service/.dist/interfaces';
import * as pb from '@sellout/models/.dist/sellout-proto';
import PbServiceProxy from '@sellout/service/.dist/PbServiceProxy';
import PbBroadcastProxy from '@sellout/service/.dist/PbBroadcastProxy';

export interface IServiceProxy {
  eventService: pb.EventService;
  broadcast: pb.Broadcast.Publisher;
  orderService: pb.OrderService;
  webFlowService: pb.WebFlowService;
  organizationService: pb.OrganizationService;
  seasonService: pb.SeasonService;
  venueService: pb.VenueService;
  taskService: pb.TaskService;
  emailService:pb.EmailService;
  fileUploadService: pb.FileUploadService;

}

export function proxyProvider(conn: IConnectionManager): IServiceProxy {
  return {
    broadcast: new PbBroadcastProxy(conn).activate(),
    orderService: new PbServiceProxy<pb.OrderService>(conn, pb.OrderService.name)
      .activate(pb.OrderService),
      seasonService: new PbServiceProxy<pb.SeasonService>(conn, pb.SeasonService.name)
    .activate(pb.SeasonService),
    webFlowService: new PbServiceProxy<pb.WebFlowService>(conn, pb.WebFlowService.name)
      .activate(pb.WebFlowService),
    organizationService: new PbServiceProxy<pb.OrganizationService>(conn, pb.OrganizationService.name)
      .activate(pb.OrganizationService),
    venueService: new PbServiceProxy<pb.VenueService>(conn, pb.VenueService.name)
      .activate(pb.VenueService),
    taskService: new PbServiceProxy<pb.TaskService>(conn, pb.TaskService.name)
      .activate(pb.TaskService),
    eventService: new PbServiceProxy<pb.EventService>(conn, pb.EventService.name)
    .activate(pb.EventService),
    emailService: new PbServiceProxy<pb.EmailService>(conn, pb.EmailService.name)
    .activate(pb.EmailService),
    fileUploadService: new PbServiceProxy<pb.FileUploadService>(conn, pb.FileUploadService.name)
      .activate(pb.FileUploadService),
  };
}
