import { IConnectionManager } from '@sellout/service/.dist/interfaces';
import * as pb from '@sellout/models/.dist/sellout-proto';
import PbServiceProxy from '@sellout/service/.dist/PbServiceProxy';

export interface IServiceProxy {
  userService: pb.UserService;
  organizationService: pb.OrganizationService;
  emailService: pb.EmailService;
}

export function proxyProvider(conn: IConnectionManager): IServiceProxy {
  return {
    userService: new PbServiceProxy<pb.UserService>(conn, pb.UserService.name)
      .activate(pb.UserService),
    organizationService: new PbServiceProxy<pb.OrganizationService>(conn, pb.OrganizationService.name)
      .activate(pb.OrganizationService),
    emailService: new PbServiceProxy<pb.EmailService>(conn, pb.EmailService.name)
      .activate(pb.EmailService),
  };
}
