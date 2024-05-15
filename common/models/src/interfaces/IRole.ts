export default interface IRole {
  _id?: string;
  orgId: string;
  userId?: string;
  userEmail: string;
  createdAt: number;
  createdBy: string;
  role: RolesEnum;
  acceptedAt?: number;
}

// BACKFILL
export enum RolesEnum {
  SUPER_USER = 'SUPER_USER',
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  BOX_OFFICE = 'BOX_OFFICE',
  SCANNER = 'SCANNER',
  USER="USER"
}

export const roleValues = {
  [RolesEnum.SUPER_USER]: 5,
  [RolesEnum.OWNER]: 4,
  [RolesEnum.ADMIN]: 3,
  [RolesEnum.BOX_OFFICE]: 2,
  [RolesEnum.SCANNER]: 1,
  [RolesEnum.USER]: 0,
};

// export enum RoleOrdinalEnum {
//   SCANNER = 0,
//   BOX_OFFICE,
//   ADMIN,
//   OWNER,
//   SUPER_USER,
// }