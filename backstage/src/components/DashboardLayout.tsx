import React from "react";
import styled from "styled-components";
import { Colors } from "@sellout/ui";
import SideNavigation from "../components/SideNavigation";
import TopNavigation from "../components/TopNavigation";
import { media, useMobileMedia } from "@sellout/ui/build/utils/MediaQuery";
import * as AppActions from "../redux/actions/app.actions";
import { useDispatch, useSelector } from "react-redux";
import { BackstageState } from "../redux/store";
import { useQuery } from "@apollo/react-hooks";
import { ModalTypes } from "../components/modal/Modal";
import USER_ROLES from "@sellout/models/.dist/graphql/queries/userRoles.query";
import usePermission from "../hooks/usePermission.hook";
import { RolesEnum } from "@sellout/models/.dist/interfaces/IRole";
import GET_PROFILE from "@sellout/models/.dist/graphql/queries/profile.query";
import * as Intercom from "../utils/Intercom";
import { useLocation, useHistory, Route } from "react-router-dom";
import * as Auth from "../utils/Auth";

const Container = styled.div`
  position: absolute;
  height: 100vh;
  width: 100vw;
`;

const ContentContainer = styled.div`
  width: 100%;
  height: calc(100% - 60px);
  margin-top: 60px;
`;

const Content = styled.div`
  background: ${Colors.OffWhite};
  height: 100%;
  width: calc(100% - 60px);
  margin-left: auto;

  ${media.mobile`
    width: 100%;
  `};
`;

const SideNavContainer = styled.div`
  width: 60px;
  height: 100%;
  position: fixed;
  top: 60px;
  bottom: 0;
  z-index: 999;
  ${media.mobile`
    display: none;
  `};
`;

type DashboardLayoutProps = {
  children: React.ReactNode;
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  /** State */
  const { pathname } = useLocation();
  const { isOnboarding } = useSelector((state: BackstageState) => state.app);
  const hideLauncher =
    useMobileMedia() ||
    pathname.includes("/create-event") ||
    pathname.includes("/venues/create") ||
    pathname.includes("/performers/create");

  /** Hooks */
  const dispatch = useDispatch();

  const history = useHistory();
  const hasPermission = usePermission();
  const { data: profileData } = useQuery(GET_PROFILE, {
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      dispatch(AppActions.setOrgId(data?.organization?._id));
    }
  });
  const { data } = useQuery(USER_ROLES);

  React.useLayoutEffect(() => {
    if (!Auth.getToken()) {
      history.push("/account");
    }
  }, [history]);

  React.useEffect(() => {
    if (profileData) {
      Intercom.boot(
        profileData.user,
        profileData.userProfile,
        profileData.organization,
        hideLauncher
      );
    }
  }, [hideLauncher, profileData]);

  React.useEffect(() => {
    let role = data?.userRoles.find((r: any) => !r.acceptedAt);
    if (role) {
      dispatch(AppActions.setRoleId(role._id));
      dispatch(AppActions.pushModal(ModalTypes.OrganizationInvite));
    }
  }, [data, dispatch]);

  const showSideNav =
    data?.userRoles.length === 0 ||
    (!isOnboarding && hasPermission(RolesEnum.BOX_OFFICE));
  /** Render */
  return (
    <Container>
      <TopNavigation showOrganization={!isOnboarding} />
      <ContentContainer>
        <SideNavContainer>
          <SideNavigation />
        </SideNavContainer>
        <Content>
          {children}
        </Content>
      </ContentContainer>
    </Container>
  );
};

export default DashboardLayout;
