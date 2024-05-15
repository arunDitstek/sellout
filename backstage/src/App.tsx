//Fix
import React, { Fragment, useEffect } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import styled from "styled-components";
import * as Auth from "./utils/Auth";
import ReactTooltip from "react-tooltip";
import * as Checkout from "./utils/Checkout";
import Modal from "./components/modal/Modal";
import AppNotification from "./components/AppNotification";
import * as Intercom from "./utils/Intercom";
// LAYOUTS
import DashboardLayout from "./components/DashboardLayout";
import AccountLayout from "./components/account/AccountLayout";
import PageLoader from "./components/PageLoader";
// PAGES
import DashboardOverview from "./pages/DashboardOverview.page";
import EventList from "./pages/EventList.page";
import SeasonList from "./pages/SeasonList.page";
import Analytics from "./pages/Analytics.page";
import CustomerList from "./pages/CustomerList.page";
import VenueList from "./pages/VenueList.page";
import OrdersList from "./pages/OrderList.page";
import AccountFlow from "./pages/AccountFlow.page";
import ForgotPassword from "./pages/ForgotPassword.page";
import ResetPassword from "./pages/ResetPassword.page";
import NotFound404 from "./pages/NotFound404.page";
import CreateOrganization from "./pages/CreateOrganization.page";
import OnboardingInvite from "./pages/OnboardingInvite.page";
import UserInfo from "./pages/UserInfo.page";
import VerifyEmail from "./pages/VerifyEmail.page";
import Unauthorized from "./pages/Unauthorized.page";
// CONTAINERS
import EventDetailsContainer from "./containers/EventDetails.container";
import SeasonDetailsContainer from "./containers/SeasonDetails.container";
import CreateEventContainer from "./containers/CreateEvent.container";
import CreateSeasonContainer from "./containers/CreateSeason.container";
import VenueDetailsContainer from "./containers/VenueDetails.container";
import CreateVenueContainer from "./containers/CreateVenue.container";
import CustomerDetailsContainer from "./containers/CustomerDetails.container";
import SettingsContainer from "./containers/Settings.container";
import SuperAdminContainer from "./containers/SuperAdmin.container";
import { RolesEnum } from "@sellout/models/.dist/interfaces/IRole";
import usePermission from "./hooks/usePermission.hook";
import UserDashboard from "./pages/userDashboard.page";
import { media } from "@sellout/ui/build/utils/MediaQuery";

const Container = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
`;

const Tooltip = styled(ReactTooltip)`
  border-radius: 10px;
  padding: 4px 10px;
  z-index: 1000000000000;
  max-width: 360px;
  ${media.mobile`
    max-width: 300px;
  `};
`;

export function AuthenticatedRoute({ role, ...props }: any) {
  const hasPermission = usePermission();
  // TODO: fix this so the page actually shows when necessary but doesn't flash
  if (!hasPermission || !hasPermission(role)) {
    return null;
  } else if (hasPermission && !hasPermission(role)) {
    return <Route {...props} component={Unauthorized} />;
  }
  return <Route {...props} />;
}

function DashboardContainer({ match }: any) {
  return (
    <DashboardLayout>
      <Switch>
        {/* Dashboard */}
        <AuthenticatedRoute
          exact
          path={`${match.path}`}
          component={DashboardOverview}
          role={RolesEnum.ADMIN}
        />
        {/* Event */}
        <AuthenticatedRoute
          exact
          path={`${match.path}/events`}
          component={EventList}
          role={RolesEnum.SCANNER}
        />
        <AuthenticatedRoute
          path={`${match.path}/events/details`}
          component={EventDetailsContainer}
          role={RolesEnum.BOX_OFFICE}
        />
        {/* Season */}
        <AuthenticatedRoute
          exact
          path={`${match.path}/seasons`}
          component={SeasonList}
          role={RolesEnum.SCANNER}
        />
        <AuthenticatedRoute
          path={`${match.path}/seasons/details`}
          component={SeasonDetailsContainer}
          role={RolesEnum.BOX_OFFICE}
        />
        {/* Orders */}
        <AuthenticatedRoute
          exact
          path={`${match.path}/orders`}
          component={OrdersList}
          role={RolesEnum.BOX_OFFICE}
        />
        {/* Analytics */}
        <AuthenticatedRoute
          exact
          path={`${match.path}/analytics`}
          component={Analytics}
          role={RolesEnum.ADMIN}
        />
        {/* Customers */}
        <AuthenticatedRoute
          exact
          path={`${match.path}/customers`}
          component={CustomerList}
          role={RolesEnum.ADMIN}
        />
        <AuthenticatedRoute
          path={`${match.path}/customers/details`}
          component={CustomerDetailsContainer}
          role={RolesEnum.ADMIN}
        />
        {/* Venue */}
        <AuthenticatedRoute
          exact
          path={`${match.path}/venues`}
          component={VenueList}
          role={RolesEnum.ADMIN}
        />
        <AuthenticatedRoute
          path={`${match.path}/venues/details`}
          component={VenueDetailsContainer}
          role={RolesEnum.ADMIN}
        />
        <AuthenticatedRoute
          path={`${match.path}/venues/create`}
          component={CreateVenueContainer}
          role={RolesEnum.ADMIN}
        />
        {/* Performer */}
        {/* <AuthenticatedRoute
          exact
          path={`${match.path}/performers`}
          component={ArtistList}
          role={RolesEnum.ADMIN}
        />
        <AuthenticatedRoute
          path={`${match.path}/performers/details`}
          component={ArtistDetailsContainer}
          role={RolesEnum.ADMIN}
        />
        <AuthenticatedRoute
          path={`${match.path}/performers/create`}
          component={CreateArtistContainer}
          role={RolesEnum.ADMIN}
        /> */}
        {/* Settings */}
        <AuthenticatedRoute
          path={`${match.path}/settings`}
          component={SettingsContainer}
          role={RolesEnum.USER}
        />
        {/* Super Admin */}
        <AuthenticatedRoute
          path={`${match.path}/super`}
          component={SuperAdminContainer}
          role={RolesEnum.SCANNER}
        />

        <Route path="*" component={NotFound404} />
      </Switch>
    </DashboardLayout>
  );
}

function AccountContainer({ match }: any) {
  return (
    <AccountLayout>
      <Switch>
        <Route exact path={`${match.path}`} component={AccountFlow} />
        <Route
          exact
          path={`${match.path}/forgotPassword`}
          component={ForgotPassword}
        />
        <Route
          exact
          path={`${match.path}/resetPassword`}
          component={ResetPassword}
        />
        <Route
          exact
          path={`${match.path}/createOrganization`}
          component={CreateOrganization}
        />
        <Route
          exact
          path={`${match.path}/onboardingInvite`}
          component={OnboardingInvite}
        />
        <Route exact path={`${match.path}/userInfo`} component={UserInfo} />
        <Route
          exact
          path={`${match.path}/verifyEmail`}
          component={VerifyEmail}
        />
        <Route path="*" component={NotFound404} />
      </Switch>
    </AccountLayout>
  );
}

function UserAccountContainer({ match }: any) {
  return (
    <AccountLayout>
      <Switch>
        <Route exact path={`${match.path}`} component={AccountFlow} />
        <Route
          exact
          path={`${match.path}/forgotPassword`}
          component={ForgotPassword}
        />
        <Route
          exact
          path={`${match.path}/resetPassword`}
          component={ResetPassword}
        />
        {/* <Route
          exact
          path={`${match.path}/createOrganization`}
          component={CreateOrganization}
        /> */}
        {/* <Route
          exact
          path={`${match.path}/onboardingInvite`}
          component={OnboardingInvite}
        /> */}
        {/* <Route
          exact
          path={`${match.path}/userInfo`}
          component={UserInfo}
        /> */}
        {/* <Route
          exact
          path={`${match.path}/verifyEmail`}
          component={VerifyEmail}
        /> */}
        <Route
          exact
          path={`${match.path}/my-tickets`}
          component={DashboardContainer}
        />
        <Route path="*" component={NotFound404} />
      </Switch>
    </AccountLayout>
  );
}

function UserDashboardContainer({ match }: any) {
  return (
    <DashboardLayout>
      <Switch>
        {/* Dashboard */}
        <AuthenticatedRoute
          exact
          path={`${match.path}`}
          component={UserDashboard}
          role={RolesEnum.USER}
        />
        <Route path="*" component={NotFound404} />
      </Switch>
    </DashboardLayout>
  );
}

export default function App() {
  useEffect(() => {
    Checkout.initialize();
    Intercom.connect();

    // prevent android keyboard shrinking viewport when
    // open and affecting percentage based div heights for whole app
    // https://stackoverflow.com/questions/32963400/android-keyboard-shrinking-the-viewport-and-elements-using-unit-vh-in-css
    const viewport = document.querySelector("meta[name=viewport]");
    if (viewport) {
      viewport.setAttribute(
        "content",
        // `width=${window.innerWidth}, initial-scale=1.0`
        `width=width=device-width, initial-scale=1.0`
      );
    }
  }, []);

  const redirect = () => {
    window.open("/user/account?section=register&step=email", "_self");
  };

  return (
    <Fragment>
      <Tooltip effect="solid"  multiline/>
      <Modal />
      <AppNotification />
      <PageLoader isVeryTop={true} />
      <Container>
        <Switch>
          <Route exact path="/">
            {Auth.getToken() ? <Redirect to="/admin/dashboard" /> : redirect}
          </Route>
          <Route exact path="/admin">
            {Auth.getToken() ? <Redirect to="/admin/dashboard" /> : redirect}
          </Route>
          <Route path="/create-event" component={CreateEventContainer} />
          <Route path="/create-season" component={CreateSeasonContainer} />
          <Route path="/admin/dashboard" component={DashboardContainer} />
          <Route path="/account" component={AccountContainer} />
          <Route path="/user/account" component={UserAccountContainer} />
          <Route path="/my-tickets" component={UserDashboardContainer} />
          <Route path="*" component={NotFound404} />
        </Switch>
      </Container>
    </Fragment>
  );
}
