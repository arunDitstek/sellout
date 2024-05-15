import React from "react";
import styled from "styled-components";
import { Colors, Icons, Icon } from '@sellout/ui';
import Menu, { MenuEventTypes } from "../elements/Menu";
import { useQuery, useMutation } from '@apollo/react-hooks';
import { setToken, logout } from '../utils/Auth';
import { useHistory } from 'react-router-dom';
import GET_PROFILE from '@sellout/models/.dist/graphql/queries/profile.query';
import SET_USER_ORG_CONTEXT_ID from '@sellout/models/.dist/graphql/mutations/setUserOrgContextId.mutation';
import USER_ROLES from '@sellout/models/.dist/graphql/queries/userRoles.query';
import * as Intercom from '../utils/Intercom';
import OrganizationLogo from './OrganizationLogo';

const MenuHeadContainer = styled.div`
  display: flex;
  width: 100%;
  padding: 20px;
  border-radius: 10px;
  box-sizing: border-box;
`;

type OrgLogoContProps = {
  size?: string;
  margin?: string;
}
// const OrganizationLogoContainer = styled.div<OrgLogoContProps>`
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   background: ${Colors.White};
//   border-radius: 10px;
//   border: 1px solid ${Colors.Grey5};
//   margin: ${props => props.margin || '0px 10px 0px 0px'};
//   width: ${props => props.size || '45px'};
//   height: ${props => props.size || '45px'};
// `;

// type OrgLogoProps = {
//   width?: string;
// }
// const OrganizationLogo = styled.img<OrgLogoProps>`
//   height: auto;
//   width: ${props => props.width || '25px'};
// `;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
  justify-content: center;
  margin-left: 8px;
`;

const OrgName = styled.div`
  font-weight: 600;
  font-size: 1.4rem;
  color: ${Colors.Grey1};
  margin-bottom: 2px;
`;

const UserName = styled.div`
  font-weight: 500;
  font-size: 1.2rem;
  color: ${Colors.Grey1};
`;

type AccountOptionsMenuProps = {
  anchorElement: any;
}

const AccountOptionsMenu: React.FC<AccountOptionsMenuProps> = ({ anchorElement }) => {
  const history = useHistory();
  const { data, loading } = useQuery(GET_PROFILE);
  const { data: roleData, loading: roleLoading } = useQuery(USER_ROLES);
  const [setOrgContext] = useMutation(SET_USER_ORG_CONTEXT_ID, {
    onError(error) {
      console.error(error);
    },
    onCompleted(data) {
      setToken(data?.setUserOrgContextId?.token);
      window.location.href = '/admin/dashboard';
    },
  });

  if (loading || roleLoading) {
    return null;
  }

  const menuItems = [
    // {
    //   text: "Switch To Personal Account",
    //   onClick: () => console.log('Switch To Personal Account'),
    //   image: (
    //     <UserImage
    //       firstName={data?.user?.firstName || ''}
    //       lastName={data?.user?.lastName || ''}
    //       imageUrl={data?.user?.userProfile.imageUrl || ''}
    //       height="30px"
    //       size="1.2rem"
    //       margin="0"
    //     />
    //   ),
    // },
    {
      space: true,
    },
    {
      text: "Settings",
      onClick: () => history.push('/admin/dashboard/settings/profile'),
      icon: Icons.SettingsRegular,
    },
    // {
    //   text: "Updates",
    //   onClick: () => console.log('Updates'),
    //   icon: Icons.Update,
    // },
    {
      text: "Chat With Support",
      onClick: () => Intercom.toggle(),
      icon: Icons.AudienceRegular,
    },
    {
      text: "Help Center",
      onClick: () => window.open('https://help.sellout.io/'),
      icon: Icons.Help,
    },
    {
      text: "Log Out",
      onClick: () => logout(),
      icon: Icons.SignOut,
    },
  ]

  const roleMenuItems = roleData?.userRoles?.filter((role: any) => {
    if (role.orgId === data?.user?.orgContextId) return false;
    return true;
  }).map((role: any) => {
    return {
      text: role.org.orgName,
      image: (
        <OrganizationLogo logoUrl={role.org.orgLogoUrl} size={30} />
      ),
      icon: Icons.HomeLight,
      onClick: () => setOrgContext({
        variables: {
          orgId: role.orgId,
        },
      }),
    };
  });

  const menuHead = (
    <MenuHeadContainer>
      <OrganizationLogo logoUrl={data?.organization?.orgLogoUrl} size={45} />
      <InfoContainer>
        <OrgName>
          {data?.organization?.orgName || ''}
        </OrgName>
        <UserName>
          {`${data?.user?.firstName} ${data?.user?.lastName}` || ''}
        </UserName>
      </InfoContainer>
    </MenuHeadContainer>
  );

  return (
    <Menu
      menuHead={menuHead}
      anchorElement={anchorElement}
      openEvent={MenuEventTypes.MouseEnter}
      closeEvent={MenuEventTypes.MouseLeave}
      menuItems={roleMenuItems.length > 0 ? roleMenuItems.concat(menuItems) : menuItems}
    />
  );
};

export default AccountOptionsMenu;
