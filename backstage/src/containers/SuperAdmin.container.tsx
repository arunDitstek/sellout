import React, { Fragment, useEffect, useState } from 'react';
import { Route, useLocation } from 'react-router-dom';
import SubSideNavigation from '../components/SubSideNavigation';
import SuperAdminSideNavButtons from '../components/SuperAdminSideNavButtons';
import { DetailsContainer, DetailsPageContentContainer } from '../components/PageLayout';
import SuperAdminOrganizations from '../pages/SuperAdminOrganizations.page';
import SuperAdminSites from '../pages/SuperAdminSites.page';
import SuperAdminSettings from '../pages/SuperAdminSettings.page';
import SuperAdminOrganizationsSettings from '../pages/SuperAdminOrganizationsSettings.page';
import EventSeasonFeesSettings from '../pages/create-event/EventSeasonfeesDetails';
import { useSelector } from 'react-redux';
import { BackstageState } from '../redux/store';

type SuperAdminContainerProps = {
  match: any
};

const SuperAdminContainer: React.FC<SuperAdminContainerProps> = ({ match }) => {
  const [isPathname, setIsPathName] = useState(false);
  const location = useLocation()
  const { pathname } = location;

  useEffect(() => {
    const path = "/admin/dashboard/super/events/settings";
    const path2 = "/admin/dashboard/super/seasons/settings"
    if (pathname === path || pathname === path2 ) {
      setIsPathName(true);
    } else {
      setIsPathName(false);
    }
  }, [isPathname, pathname]);


  /* Render */
  return (
    <>
      <DetailsContainer>
        {!isPathname && <SubSideNavigation>
          <SuperAdminSideNavButtons />
        </SubSideNavigation>}
        <DetailsPageContentContainer>
          <Route
            exact
            path={`${match.url}/organizations`}
            component={SuperAdminOrganizations}
          />
          <Route
            path={`${match.url}/sites`}
            component={SuperAdminSites}
          />
          <Route
            path={`${match.url}/settings`}
            component={SuperAdminSettings}
          />
          <Route
            path={`${match.url}/organizations/settings`}
            component={SuperAdminOrganizationsSettings}
          />
          <Route
            path={`${match.path}/events/settings`}
            component={EventSeasonFeesSettings}
          />
          <Route
            path={`${match.path}/seasons/settings`}
            component={EventSeasonFeesSettings}
          />
        </DetailsPageContentContainer>
      </DetailsContainer>
    </>
  );
};

export default SuperAdminContainer;

