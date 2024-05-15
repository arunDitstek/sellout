import React, { Fragment, useEffect } from "react";
import styled from "styled-components";
import Masonry from "react-masonry-component";
import SeasonCard from "../components/SeasonCard";
import PageLoader from "../components/PageLoader";
import useNavigateToSeasonDetails from "../hooks/useNavigateToSeasonDetails.hook";
import useListSeasonsHook from "../hooks/useListSeasons.hook";
import NoPageContent, { NoPageContentTypes } from "../components/NoPageContent";
import { RolesEnum } from "@sellout/models/.dist/interfaces/IRole";
import usePermission from "../hooks/usePermission.hook";
import { AppNotificationTypeEnum } from "../models/interfaces/IAppNotification";
import * as AppActions from "../redux/actions/app.actions";
import { PaddedPage } from "../components/PageLayout";
import { Colors } from "@sellout/ui";
import useNavigateToCreateSeason from "../hooks/useNavigateToCreateSeason.hook";
import { SeasonQueryEnum } from "../models/enums/SeasonQueryEnum";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../redux/store";
import { Route, useLocation } from "react-router";
import { ISeasonGraphQL } from "@sellout/models/.dist/interfaces/ISeason";
import NotFound404 from "./NotFound404.page";
import { useQuery } from "@apollo/react-hooks"; 
import GET_PROFILE from "@sellout/models/.dist/graphql/queries/profile.query";

const SubNavContainer = styled.div`
  display: flex;
  margin-bottom: 24px;
`;

type SubNavItemProps = {
  active: boolean;
};
const SubNavItem = styled.div<SubNavItemProps>`
  transition: all 0.2s;
  color: ${(props) => (props.active ? `${Colors.Grey1}` : `${Colors.Grey4}`)};
  font-weight: 600;
  font-size: 1.8rem;
  cursor: pointer;
  margin-right: 24px;
`;

type SeasonListProps = {
  match: any;
};

const SeasonList: React.FC<SeasonListProps> = ({ match }) => {
  /* Hooks */
  const location = useLocation();
  const dispatch = useDispatch();
  const hasPermission = usePermission();
  const navigateToSeasonDetails = useNavigateToSeasonDetails();
  const navigateToCreateSeason = useNavigateToCreateSeason();
  const params: any = new URLSearchParams(location.search);
  const [queryKey, setQueryKey] = React.useState(
    SeasonQueryEnum.MainSeasonListUpComing
  );
  const { seasonQueryHash } = useSelector((state: BackstageState) => state.app);
  const query = seasonQueryHash[queryKey];
  const isPastSeason = queryKey === SeasonQueryEnum.MainSeasonListPast;
  const { seasons, loading } = useListSeasonsHook({
    variables: {
      query,
    },
    fetchPolicy: "network-only",
  });
  /** State */
  const showScannerNotification = () =>
    dispatch(
      AppActions.showNotification(
        "Web scanning coming soon. Please download the 'Sellout Access Control' app in the ios store or google play store from your phone in order to scan tickets.",
        AppNotificationTypeEnum.Warning
      )
    );
  const isScanner = hasPermission && !hasPermission(RolesEnum.BOX_OFFICE);

  // when we do filtering we should add an ordering (asc or desc) params to the query to take care of this
  const sortSeaons = (seasons: ISeasonGraphQL[]) => {
    return isPastSeason
      ? seasons.sort(
          (a, b) =>
            (b?.schedule?.startsAt as number) -
            (a?.schedule?.startsAt as number)
        )
      : seasons.sort(
          (a, b) =>
            (a?.schedule?.startsAt as number) -
            (b?.schedule?.startsAt as number)
        );
  };

  useEffect(() => {
    if (SeasonQueryEnum[params.get("type")]) {
      setQueryKey(params.get("type"));
    }
  }, [params.get("type")]);

  const { data } = useQuery(GET_PROFILE);
  const isSeasonTickets = data?.organization?.isSeasonTickets === false;

  /* Render */
  return (
    <Fragment>
      {(() => {
        if (isSeasonTickets) {
          return <Route path="*" component={NotFound404} />;
        }
        return (
          <>
            <PageLoader nav={true} fade={Boolean(!loading)} />
            <PaddedPage>
              <SubNavContainer>
                <SubNavItem
                  onClick={() =>
                    setQueryKey(SeasonQueryEnum.MainSeasonListUpComing)
                  }
                  active={SeasonQueryEnum.MainSeasonListUpComing === queryKey}
                >
                  Upcoming
                </SubNavItem>
                <SubNavItem
                  onClick={() =>
                    setQueryKey(SeasonQueryEnum.MainSeasonListPast)
                  }
                  active={SeasonQueryEnum.MainSeasonListPast === queryKey}
                >
                  Past
                </SubNavItem>
                {/* <SubNavItem
            onClick={() => setQueryKey(SeasonQueryEnum.MainSeasonListCancelled)}
            active={SeasonQueryEnum.MainSeasonListCancelled === queryKey}
          >
            Cancelled
          </SubNavItem> */}
              </SubNavContainer>
              {seasons && seasons.length > 0 && !loading ? (
                <Masonry
                  options={{ horizontalOrder: true }}
                  enableResizableChildren
                >
                  {sortSeaons(seasons)?.map((season: ISeasonGraphQL) => {
                    return (
                      <Fragment key={season._id}>
                        {!season.cancel &&
                          SeasonQueryEnum.MainSeasonListUpComing ===
                            queryKey && (
                            <SeasonCard
                              key={season._id}
                              season={season}
                              margin="0 24px 24px 0"
                              onClick={() => {
                                if (isScanner) {
                                  showScannerNotification();
                                } else if (season?.published) {
                                  navigateToSeasonDetails(season._id);
                                } else {
                                  navigateToCreateSeason(season._id);
                                }
                              }}
                            />
                          )}
                        {!season.cancel &&
                          SeasonQueryEnum.MainSeasonListPast === queryKey && (
                            <SeasonCard
                              key={season._id}
                              season={season}
                              margin="0 24px 24px 0"
                              onClick={() => {
                                if (isScanner) {
                                  showScannerNotification();
                                } else if (season?.published) {
                                  navigateToSeasonDetails(season._id);
                                } else {
                                  navigateToCreateSeason(season._id);
                                }
                              }}
                            />
                          )}
                        {/* {season.cancel &&
                    SeasonQueryEnum.MainSeasonListCancelled === queryKey && (
                      <SeasonCard
                        key={season._id}
                        season={season}
                        margin="0 24px 24px 0"
                        onClick={() => {
                          if (isScanner) {
                            showScannerNotification();
                          } else if (season?.published) {
                            navigateToEventDetails(season._id);
                          } else {
                            navigateToCreateEvent(season._id);
                          }
                        }}
                      />
                    )} */}
                      </Fragment>
                    );
                  })}
                </Masonry>
              ) : (
                <>
                  {!loading && (
                    <NoPageContent type={NoPageContentTypes.Season} />
                  )}
                </>
              )}
            </PaddedPage>
          </>
        );
      })()}
    </Fragment>
  );
};

export default SeasonList;
