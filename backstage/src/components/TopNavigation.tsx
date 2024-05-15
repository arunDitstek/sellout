import React, { Fragment, useState, useRef } from "react";
import styled from "styled-components";
import { useQuery } from "@apollo/react-hooks";
import SelloutLogoImg from "../assets/images/sellout-logo-mono-white.svg";
import { useLocation, useHistory } from "react-router-dom";
import { Button, Colors, Flex, Icon, Icons } from "@sellout/ui";
import { media } from "@sellout/ui/build/utils/MediaQuery";
import MobileSideNavigation from "./MobileSideNavigation";
import AccountOptionsMenu from "./AccountOptionsMenu";
import CreateEventBreadCrumb from "./create-event/CreateEventBreadCrumb";
import CreateArtistBreadCrumb from "./create-artist/CreateArtistBreadCrumb";
import GET_PROFILE from "@sellout/models/.dist/graphql/queries/profile.query";
import { useMobileMedia } from "@sellout/ui/build/utils/MediaQuery";
import OrganizationLogo from "./OrganizationLogo";
import TopNavWarning from "./TopNavWarning";
import CreateVenueNavigation from "./create-venue/CreateVenueNavigation";
import ArtistDetailsBreadCrumb from "./ArtistDetailsBreadCrumb";
import EventDetailsBreadCrumb from "./EventDetailsBreadCrumb";
import VenueDetailsBreadCrumb from "./VenueDetailsBreadCrumb";
import CustomerDetailsBreadCrumb from "./CustomerDetailsBreadCrumb";
import CreateSeasonBreadCrumb from "./create-season/CreateSeasonBreadCrumb";

const Container = styled.div`
  position: fixed;
  width: 100%;
  background-color: ${Colors.Blue};
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 2000;
  left: 0px;
  right: 0px;

  ${media.mobile`
    padding: 10px 0px;
  `};

  ${media.desktop`
    height: 60px;
  `};

  @media print {
    display: none;
  }
`;

const ContentContainer = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
`;

const SelloutLogoContainer = styled.div`
  justify-content: center;
  align-items: center;
  background: ${Colors.LightBlue};
  height: 100%;
  width: 60px;

  ${media.mobile`
     display: none;
     margin-right: 15px;
  `};

  ${media.desktop`
    display: flex;
    margin-right: 25px;
  `};
`;

const HamburgerMenuContainer = styled.div`
  height: 30px;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  margin-right: 15px;
  align-items: center;
  justify-content: center;
  width: 50px;

  ${media.mobile`
    display: flex;
    margin-right: 0px;
    margin-left: 5px;
  `};

  ${media.desktop`
    display: none;
  `};
`;

const SelloutLogo = styled.img`
height:50px !important;
width:40px;`;

const Title = styled.div`
  font-weight: 600;
  color: ${Colors.White};

  ${media.mobile`
    font-size: 14px;
  `};

  ${media.desktop`
    font-size: 2.2rem;
  `};
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 10px;
  text-align: right;
  justify-content: center;

  ${media.mobile`
    display: none;
  `};
`;

const Spacer = styled.div`
  width: 10px;
`;

const OrgName = styled.div`
  font-weight: 600;
  font-size: 1.4rem;
  color: ${Colors.White};
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserName = styled.div`
  font-weight: 500;
  font-size: 1.2rem;
  color: ${Colors.White};
`;

const OrgContainer = styled.div`
  display: flex;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease-out;
  align-items: center;

  ${media.desktop`
    padding: 5px 10px;
    margin-right: 15px;
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  `};
`;

const TopNavWarningLink = styled.div`
  text-decoration: underline;
  cursor: pointer;
`;

const getTopNavInfo = (pathname: string) => {
  if (pathname.slice(pathname.length - 1) === "/") {
    pathname = pathname.slice(0, -1);
  }

  if (pathname.includes("/create-event")) {
    return {
      component: <CreateEventBreadCrumb />,
    };
  }

  if (pathname.includes("/create-season")) {
    return {
      component: <CreateSeasonBreadCrumb />,
    };
  }

  if (pathname.includes("/performers/create")) {
    return {
      component: <CreateArtistBreadCrumb />,
    };
  }

  if (pathname.includes("/venues/create")) {
    return {
      component: <CreateVenueNavigation />,
    };
  }

  if (pathname.includes("/venues/details")) {
    return {
      component: <VenueDetailsBreadCrumb />,
    };
  }

  if (pathname.includes("/events/details")) {
    return {
      component: <EventDetailsBreadCrumb />,
    };
  }

  if (pathname.includes("/customers/details")) {
    return {
      component: <CustomerDetailsBreadCrumb />,
    };
  }

  if (pathname.includes("/performers/details")) {
    return {
      component: <ArtistDetailsBreadCrumb />,
    };
  }

  if (pathname.includes("/settings")) {
    return {
      title: "Settings",
    };
  }

  switch (pathname) {
    case "/admin/dashboard":
      return {
        title: "Dashboard",
      };
    case "/admin/dashboard/events":
      return {
        title: "All Events",
      };
    case "/admin/dashboard/orders":
      return {
        title: "All Orders",
      };
    case "/admin/dashboard/analytics":
      return {
        title: "Analytics",
      };
    case "/admin/dashboard/customers":
      return {
        title: "All Customers",
      };
    case "/admin/dashboard/performers":
      return {
        title: "All Performers",
      };
    case "/admin/dashboard/venues":
      return {
        title: "All Venues",
      };
    case "/my-tickets":
      return {
        title: "My Tickets",
      };
    case "/admin/dashboard/seasons":
      return {
        title: "All Seasons",
      };
    default:
      return {
        title: "Sellout",
      };
  }
};

type TopNavigationProps = {
  showOrganization?: boolean;
};

const TopNavigation: React.FC<TopNavigationProps> = ({
  showOrganization = true,
}) => {
  /** Hooks */
  const isMobile = useMobileMedia();
  const [sideNavIsOpen, setSideNavIsOpen] = useState<boolean>(false);
  const [icon, setIcon] = useState<boolean>(false);

  const anchorElement = useRef(null);
  const anchorElement1 = useRef(null);
  const { data, loading, error } = useQuery(GET_PROFILE, {
    skip: !showOrganization,
  });
  const { pathname } = useLocation();
  const history = useHistory();

  /** State */
  const topNavInfo = getTopNavInfo(pathname);
  const showWarning = Boolean(
    data?.organization &&
    !data?.organization.stripeId &&
    !pathname.includes("/create-event")
  );

  /** Render */
  return (
    <Fragment>
      <Container>
        <ContentContainer>
          <SelloutLogoContainer>
            <SelloutLogo src={SelloutLogoImg} />
          </SelloutLogoContainer>
          <HamburgerMenuContainer
            onClick={() => setSideNavIsOpen(!sideNavIsOpen)}
          >
            <Icon icon={Icons.Menu} color={Colors.White} size={18} />
          </HamburgerMenuContainer>
          {topNavInfo.title && <Title>{topNavInfo.title}</Title>}
          {topNavInfo.component && topNavInfo.component}
          {showWarning && data.user.role && (
            <TopNavWarning>
              <Flex>
                <div>You must connect Stripe to publish events.&nbsp;</div>
                <TopNavWarningLink
                  onClick={() =>
                    history.push("/admin/dashboard/settings/payouts")
                  }
                >
                  Click here to connect Stripe
                </TopNavWarningLink>
              </Flex>
            </TopNavWarning>
          )}
        </ContentContainer>
        <ContentContainer>
          {data && showOrganization && (
            <OrgContainer ref={anchorElement}>
              <InfoContainer>
                <OrgName>{data?.organization?.orgName || ""}</OrgName>
                <UserName>
                  {`${data?.user?.firstName} ${data?.user?.lastName}` || ""}
                </UserName>
              </InfoContainer>
              <OrganizationLogo
                logoUrl={data.organization.orgLogoUrl}
                size={isMobile ? 30 : 40}
              />
              {isMobile && <Spacer />}
              <AccountOptionsMenu anchorElement={anchorElement} />
            </OrgContainer>
          )}
        </ContentContainer>
      </Container>
      <MobileSideNavigation
        visible={sideNavIsOpen}
        setVisible={setSideNavIsOpen}
      />
    </Fragment>
  );
};

export default TopNavigation;
