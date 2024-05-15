import { IConnectionManager } from '@sellout/service/.dist/interfaces';
import * as pb from '@sellout/models/.dist/sellout-proto';
import PbServiceProxy from '@sellout/service/.dist/PbServiceProxy';

export interface IServiceProxy {
  organizationService: pb.OrganizationService;
  userService: pb.UserService;
  userProfileService: pb.UserProfileService;
}

export function proxyProvider(conn: IConnectionManager): IServiceProxy {
  return {
    organizationService: new PbServiceProxy<pb.OrganizationService>(conn, pb.OrganizationService.name)
      .activate(pb.OrganizationService),
    userService: new PbServiceProxy<pb.UserService>(conn, pb.UserService.name)
      .activate(pb.UserService),
    userProfileService: new PbServiceProxy<pb.UserProfileService>(conn, pb.UserProfileService.name)
      .activate(pb.UserProfileService),
  };
}
