import React from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import SubSideNavigationButtons from '../elements/SubSideNavigationButtons';
import { Icons } from '@sellout/ui'

type SuperAdminSideNavButtonsProps = {};
const SuperAdminSideNavButtons: React.FC<SuperAdminSideNavButtonsProps> = () => {
  const { pathname } = useLocation();
  const history = useHistory();

  const buttons = [
    {
      icon: Icons.OrganizationLight,
      activeIcon: Icons.OrganizationSolid,
      text: 'Organizations',
      onClick: () => history.push(`/admin/dashboard/super/organizations`),
      active: () => pathname === '/admin/dashboard/super/organizations'
      || pathname === '/admin/dashboard/super/organizations/settings',
    },
    {
      icon: Icons.ShareLight,
      activeIcon: Icons.ShareSolid,
      text: 'Sites',
      onClick: () => history.push(`/admin/dashboard/super/sites`),
      active: () => pathname === '/admin/dashboard/super/sites',
    },
    {
      icon: Icons.MetricsLight,
      activeIcon: Icons.MetricsSolid,
      text: 'Platform Settings',
      onClick: () => history.push(`/admin/dashboard/super/settings`),
      active: () => pathname === '/admin/dashboard/super/settings',
    },
  ];

  return <SubSideNavigationButtons buttons={buttons} />;
};

export default SuperAdminSideNavButtons;
