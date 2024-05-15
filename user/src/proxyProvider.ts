import { IConnectionManager } from '@sellout/service/.dist/interfaces';
import * as pb from '@sellout/models/.dist/sellout-proto';
import PbServiceProxy from '@sellout/service/.dist/PbServiceProxy';

export interface IServiceProxy {
  userProfileService: pb.UserProfileService;
  organizationService: pb.OrganizationService;
  roleService: pb.RoleService;
  emailService: pb.EmailService;
  plivoService: pb.PlivoService;
  stripeService: pb.StripeService;
  orderService: pb.OrderService;
}

export function proxyProvider(conn: IConnectionManager): IServiceProxy {
  return {
    userProfileService: new PbServiceProxy<pb.UserProfileService>(conn, pb.UserProfileService.name)
      .activate(pb.UserProfileService),
    organizationService: new PbServiceProxy<pb.OrganizationService>(conn, pb.OrganizationService.name)
      .activate(pb.OrganizationService),
    roleService: new PbServiceProxy<pb.RoleService>(conn, pb.RoleService.name)
      .activate(pb.RoleService),
    emailService: new PbServiceProxy<pb.EmailService>(conn, pb.EmailService.name)
      .activate(pb.EmailService),
    plivoService: new PbServiceProxy<pb.PlivoService>(conn, pb.PlivoService.name)
      .activate(pb.PlivoService),
    stripeService: new PbServiceProxy<pb.StripeService>(conn, pb.StripeService.name)
      .activate(pb.StripeService),
    orderService: new PbServiceProxy<pb.OrderService>(conn, pb.OrderService.name)
      .activate(pb.OrderService),
  };
}
