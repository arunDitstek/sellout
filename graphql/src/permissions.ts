import * as pb from "@sellout/models/.dist/sellout-proto";
import { IServiceProxy } from "./proxyProvider";
import { RolesEnum, roleValues } from '@sellout/models/.dist/interfaces/IRole'

const superUsers = [
  'sam@sellout.io', 
  'mike@sellout.io', 
  'joel@sellout.io', 
  'henry@sellout.io',
  'tom@whitewater.dev'
];

export const roles = RolesEnum;

export async function hasPermission(
    proxy: IServiceProxy,
    spanContext: string, 
    user: any, 
    requiredRole: string
  ): Promise<Boolean> {

  if (superUsers.includes(user.userEmail)) {
    return true;
  }

  // if (!user.orgId) {
  //   return true;
  // }

  if (!proxy || !spanContext || !user || !user.userId || !requiredRole) {
    return false;
  }
  
  let requiredRoleValue = roleValues[requiredRole];
  if (typeof requiredRoleValue === 'undefined') {
    return false;
  }

  const roleRequest = pb.FindUserRoleRequest.create({
    spanContext,
    userId: user.userId,
    orgId: user.orgId,
  });

  let roleResponse: pb.FindUserRoleResponse;

  try {
    roleResponse = await proxy.roleService.findUserRole(roleRequest);
  } catch(e) {
    return false;
  }

  let { role } = roleResponse;

  if(!role) return false;

  // roleValue for role does not exist
  let userRoleValue = roleValues[role.role];
  if (typeof userRoleValue === 'undefined') {
     return false;
  }

  // User does not have minimum role level
  if(requiredRoleValue > userRoleValue ) {
     return false;
  }

  // User has access
  return true;
}

