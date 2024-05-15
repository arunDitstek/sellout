import React from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import SubSideNavigationButtons from '../elements/SubSideNavigationButtons';
import { Icons } from '@sellout/ui'
import { RolesEnum } from "@sellout/models/.dist/interfaces/IRole";

type PropTypes = {
  children?: React.ReactNode;
};

const SettingsSideNavButtons: React.FC<PropTypes> = ({ children }) =>{
  const { pathname } = useLocation();
  const history = useHistory();
  const buttons = [
    {
      icon: Icons.UserLight,
      activeIcon: Icons.UserSolid,
      text: 'Personal',
      onClick: () => history.push('/admin/dashboard/settings/profile'),
      active: () => pathname === '/admin/dashboard/settings/profile',
      role: RolesEnum.USER,
    },
    {
      icon: Icons.OrganizationLight,
      activeIcon: Icons.OrganizationSolid,
      text: 'Organization',
      onClick: () => history.push('/admin/dashboard/settings/organization'),
      active: () => pathname === '/admin/dashboard/settings/organization',
      role: RolesEnum.ADMIN,
    },
    {
      icon: Icons.TeamLight,
      activeIcon: Icons.TeamSolid,
      text: 'Team',
      onClick: () => history.push('/admin/dashboard/settings/team'),
      active: () => pathname === '/admin/dashboard/settings/team',
      role: RolesEnum.ADMIN,
    },
    {
      icon: Icons.PiggyBankLight,
      activeIcon: Icons.PiggyBankSolid,
      text: 'Bank Payouts',
      onClick: () => history.push('/admin/dashboard/settings/payouts'),
      active: () => pathname === '/admin/dashboard/settings/payouts',
      role: RolesEnum.ADMIN,
    },
    {
      icon: Icons.CalculatorLight,
      activeIcon: Icons.CalculatorSolid,
      text: 'Credit Card readers',
      onClick: () => history.push('/admin/dashboard/settings/devices'),
      active: () => pathname === '/admin/dashboard/settings/devices',
      role: RolesEnum.BOX_OFFICE,
    },
  ];

  return <SubSideNavigationButtons buttons={buttons} />;
};

export default SettingsSideNavButtons;
