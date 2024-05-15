import React, { Fragment } from "react";
import styled from "styled-components";
import SeasonOverview from "../pages/SeasonOverview.page";
import SeasonMetrics from "../pages/SeasonMetrics.page";
import SeasonOrders from "../pages/SeasonOrders.page";
import SeasonSharing from "../pages/SeasonSharing.page";
import SeasonReports from "../pages/SeasonReports.page";
import SubSideNavigation from "../components/SubSideNavigation";
import SeasonSideNavButtons from "../components/SeasonSideNavButtons";
import SeasonCard from "../components/SeasonCard";
import PageLoader from "../components/PageLoader";
import { Colors, Icons, Icon } from "@sellout/ui";
import useSeason from "../hooks/useSeason.hook";
import * as Checkout from "../utils/Checkout";
import { DetailsContainer } from "../components/PageLayout";
import { AuthenticatedRoute } from "../App";
import { RolesEnum } from "@sellout/models/.dist/interfaces/IRole";
import { EPurchasePortalModes } from "@sellout/models/.dist/enums/EPurchasePortalModes";
import { useSelector } from "react-redux";
import { BackstageState } from "../redux/store";
import { EventQueryEnum } from "../models/enums/EventQueryEnum";
import { ISeasonGraphQL } from "@sellout/models/.dist/interfaces/ISeason";

const MainActionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 0px 16px;
`;

type MainActionItemProps = {
  margin?: string;
};

const MainActionItem = styled.div<MainActionItemProps>`
  color: ${Colors.Grey2};
  font-size: 1.2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  padding: 7px 0px;
  width: 55px;
  border-radius: 10px;

  &:hover {
    background: ${Colors.Grey6};
  }
`;

type SeasonDetailsContainerProps = {
  match: any;
};

const SeasonDetailsContainer: React.FC<SeasonDetailsContainerProps> = ({
  match,
}) => {
  /* Hooks */
  const { season, seasonId } = useSeason("", true);
  React.useLayoutEffect(() => {
    Checkout.preload("", seasonId);
  }, []);

  const { eventQueryHash } = useSelector((state: BackstageState) => state.app);
  const eventDate: any =
    eventQueryHash[EventQueryEnum.MainEventListPast].endDate;
  const isPastSeaosns: any = ((season?.schedule?.endsAt as any) <
    eventDate) as any;

  /* Render */
  return (
    <Fragment>
      <PageLoader nav={true} fade={Boolean(season)} />
      {season && (
        <DetailsContainer>
          <SubSideNavigation>
            <SeasonCard
              season={season as ISeasonGraphQL}
              margin="0 0 16px 0"
              footer={false}
            />
            {
              <MainActionsContainer>
                <MainActionItem
                  onClick={() =>
                    Checkout.open(
                      "",
                      seasonId,
                      EPurchasePortalModes.BoxOffice,
                      false
                    )
                  }
                >
                  <Icon
                    icon={Icons.BoxOfficeLight}
                    color={Colors.Grey2}
                    margin="0px 0px 5px 0px"
                    size={18}
                  />
                  <div>Sell</div>
                </MainActionItem>
                <MainActionItem
                  margin="0px 15px"
                  onClick={() =>
                    Checkout.open(
                      "",
                      seasonId,
                      EPurchasePortalModes.BoxOffice,
                      true
                    )
                  }
                >
                  <Icon
                    icon={Icons.GiftLight}
                    color={Colors.Grey2}
                    margin="0px 0px 5px 0px"
                    size={18}
                  />
                  <div>Comp</div>
                </MainActionItem>
                <MainActionItem>
                  <Icon
                    icon={Icons.Scan}
                    color={Colors.Grey2}
                    margin="0px 0px 5px 0px"
                    size={18}
                  />
                  <div>Scan</div>
                </MainActionItem>
              </MainActionsContainer>
            }
            <SeasonSideNavButtons />
          </SubSideNavigation>
          <>
            <AuthenticatedRoute
              path={`${match.url}/overview`}
              component={SeasonOverview}
              role={RolesEnum.BOX_OFFICE}
            />
            <AuthenticatedRoute
              path={`${match.url}/sharing`}
              component={SeasonSharing}
              role={RolesEnum.ADMIN}
            />
            <AuthenticatedRoute
              path={`${match.url}/metrics`}
              component={SeasonMetrics}
              role={RolesEnum.ADMIN}
            />
            <AuthenticatedRoute
              path={`${match.url}/orders`}
              component={SeasonOrders}
              role={RolesEnum.BOX_OFFICE}
            />
            <AuthenticatedRoute
              path={`${match.url}/reports`}
              component={SeasonReports}
              role={RolesEnum.ADMIN}
            />
          </>
        </DetailsContainer>
      )}
    </Fragment>
  );
};

export default SeasonDetailsContainer;
