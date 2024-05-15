import React from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';
import SettingsUserProfile from '../pages/SettingsUserProfile.page';
import SettingsOrganization from '../pages/SettingsOrganization.page';
import SettingsTeam from "../pages/SettingsTeam.page";
import SettingsDevices from "../pages/SettingsDevices.page";
import SettingsPayouts from "../pages/SettingsPayouts.page";
import SubSideNavigation from '../components/SubSideNavigation';
import SettingsSideNavButtons from '../components/SettingsSideNavButtons';
import GET_PROFILE from '@sellout/models/.dist/graphql/queries/profile.query';
import PageLoader from "../components/PageLoader";
import { DetailsContainer, DetailsPageContentContainer } from '../components/PageLayout';
import { RolesEnum } from "@sellout/models/.dist/interfaces/IRole";
import usePermission from '../hooks/usePermission.hook';
import { AuthenticatedRoute } from '../App';

type SettingsContainerProps = {
  match: any
};

const SettingsContainer: React.FC<SettingsContainerProps> = ({ match }) => {
  /** Hooks */

  const { data } = useQuery(GET_PROFILE);
  const hasPermission = usePermission();

  /** Render */
  return (
    <>
      <PageLoader nav={true} fade={Boolean(data?.user && data?.organization)} />
      {data?.user && data?.organization && 
      <DetailsContainer>
        {hasPermission(RolesEnum.USER) && (
          <SubSideNavigation>
            <SettingsSideNavButtons />
          </SubSideNavigation>
        )}
        <DetailsPageContentContainer>
          <AuthenticatedRoute
            path={`${match.url}/profile`}
            component={SettingsUserProfile}
            role={RolesEnum.USER}
          />
          <AuthenticatedRoute
            path={`${match.url}/organization`}
            component={SettingsOrganization}
            role={RolesEnum.ADMIN}
          />
          <AuthenticatedRoute
            path={`${match.url}/team`}
            component={SettingsTeam}
            role={RolesEnum.ADMIN}
          />
          <AuthenticatedRoute
            path={`${match.url}/payouts`}
            component={SettingsPayouts}
            role={RolesEnum.ADMIN}
          />
          <AuthenticatedRoute
            path={`${match.url}/devices`}
            component={SettingsDevices}
            role={RolesEnum.BOX_OFFICE}
          />
        </DetailsPageContentContainer>
      </DetailsContainer>}
    </>
  );
};

export default SettingsContainer;
