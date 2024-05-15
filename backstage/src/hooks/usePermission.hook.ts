import React from 'react';
import { useQuery } from "@apollo/react-hooks";
import GET_PROFILE from '@sellout/models/.dist/graphql/queries/profile.query';
import IS_SUPER_USER from '@sellout/models/.dist/graphql/queries/isSuperUser.query';
import { RolesEnum, roleValues } from '@sellout/models/.dist/interfaces/IRole'

type HasPermission = (requiredRole: RolesEnum | null) => (boolean | null);

type UsePermissionHook = () => HasPermission;

let defaultRoleState: any = null;
let defaultIsSuperUser: any = null;

const usePermissionHook: UsePermissionHook = (): HasPermission => {
  /* State */
  const [role, setRole] = React.useState<RolesEnum | null>(defaultRoleState);
  const [isSuperUser, setIsSuperUser] = React.useState<boolean | null>(defaultIsSuperUser);

  /* Hooks */
  const { loading } = useQuery(GET_PROFILE, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if(data?.user?.role===null){
        setRole(RolesEnum.USER);
        defaultRoleState = RolesEnum.USER;
      }
      if (data?.user?.role?.role ?? false) {
        setRole(data?.user?.role?.role);
        defaultRoleState = data?.user?.role?.role;
      }
    },
  });

  const { loading: superLoading } = useQuery(IS_SUPER_USER, {
    onCompleted: (data) => {
      setIsSuperUser(data.isSuperUser);
      defaultIsSuperUser = data.isSuperUser;
    },
  });

  /* Return */
  return (requiredRole: RolesEnum | null): boolean => {
    if (isSuperUser) return true;
    
    if (!role) return false;
    if(!requiredRole) return false;
    
    //if(requiredRole !== role) return false
    // roleValue for role does not exist
    let userRoleValue = roleValues[role];
    if (typeof userRoleValue === 'undefined') {
      return false;
    }

    let requiredRoleValue = roleValues[requiredRole];
    if (typeof userRoleValue === 'undefined') {
      return false;
    }

    // User does not have minimum role level
    if (requiredRoleValue > userRoleValue) {
      return false;
    }

    // User has access
    return true;
  };
};

export default usePermissionHook;
