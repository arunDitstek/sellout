import React from "react";
import styled from "styled-components";
import { Route } from "react-router-dom";
import { useQuery } from "@apollo/react-hooks";
import { useDispatch } from "react-redux";
import { Colors } from "@sellout/ui";
import { media } from "@sellout/ui/build/utils/MediaQuery";
import CreateSeasonDetails from "../pages/create-season/CreateSeasonDetails.page";
import NotFound404 from "../pages/NotFound404.page";
import CreateSeasonDatesTimes from "../pages/create-season/CreateSeasonDatesTimes.page";
import CreateEventTicketTypes from "../pages/create-event/CreateEventTicketTypes.page";
import CreateEventPromotions from "../pages/create-event/CreateEventPromotions.page";
import CreateEventAdvancedOptions from "../pages/create-event/CreateEventAdvancedOptions.page";
import CreateSeasonControls from "../components/create-season/CreateSeasonControls";
import CreateSeasonPreview from "../components/create-season/CreateSeasonPreview";
import * as AppActions from "../redux/actions/app.actions";
import PageLoader from "../components/PageLoader";
import DashboardLayout from "../components/DashboardLayout";
import ISaveChanges from "../models/interfaces/ISaveChanges";
import saveChangesState from "../models/states/saveChanges.state";
import * as ChangeUtil from "../utils/ChangeUtil";
import { ModalTypes } from "../components/modal/Modal";
import useSeason from "../hooks/useSeason.hook";
import * as SeasonActions from "../redux/actions/season.actions";
import GET_PROFILE from "@sellout/models/.dist/graphql/queries/profile.query";

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

const Content = styled.div`
  position: relative;
  background: ${Colors.OffWhite};
  height: 100%;
  flex: 1;
  min-width: 700px;
  overflow: scroll;
  ${media.mobile`
  min-width: 100%;
  `};
`;

const HideOnMobile = styled.div`
  ${media.mobile`
    display: none;
  `};

  ${media.desktop`
    width: 400px;
  `};

  ${media.giant`
    flex: 1;
  `};
`;

type CreateSeasonContainerProps = {
  match: any;
};

const CreateSeasonContainer: React.FC<CreateSeasonContainerProps> = ({
  match,
}) => {
  /* Hooks */
  const { season, seasonId } = useSeason();

  /* Actions */
  const dispatch = useDispatch();
  const saveSeason = () => dispatch(SeasonActions.saveSeason(false, true));
  const reCacheSeason = () => dispatch(SeasonActions.reCacheSeason(seasonId, true));

  const setSaveChanges = (saveChanges: Partial<ISaveChanges>) => {
    dispatch(AppActions.setSaveChanges(saveChanges));
  };

  const popModal = () => dispatch(AppActions.popModal());
  const pushPublishModal = () =>
    dispatch(AppActions.pushModal(ModalTypes.PublishSeasonModal));

  const isSaved = Boolean(season?.createdAt);
  const isPublished = Boolean(season?.published);

  let message =
    "Your season has not been saved. Would you like to discard the season or save it as a draft?";
  let confirmText = "SAVE DRAFT";
  let cancelText = "DISCARD SEASON";

  if (isSaved) {
    message =
      "Your season has unsaved changes. Would you like to discard changes or apply the changes to your season?";
    confirmText = "SAVE CHANGES";
    cancelText = "DISCARD CHANGES";
  }

  if (isPublished) {
    message =
      "You have made changes to a published season. Would you like to update the season or discard your changes?";
    confirmText = "UPDATE SEASON";
    cancelText = "DISCARD CHANGES";
  }

  /** Effects */
  React.useEffect(() => {
    async function effect() {
      if (season) {
        setSaveChanges({
          title: "Unsaved changes",
          message: message,
          confirmText: confirmText,
          cancelText: cancelText,
          hasChanges: await ChangeUtil.hasSeasonChanged(season),
          saveChanges: () => {
            if (isPublished) {
              pushPublishModal();
            } else {
              saveSeason();
            }
          },
          discardChanges: () => reCacheSeason(),
        });
      }
    }
    effect();
    return () => setSaveChanges(saveChangesState());
  }, [season]);

  const { data } = useQuery(GET_PROFILE);
  const isSeasonTickets = data?.organization?.isSeasonTickets === false;

  /** Render */
  return (
    <DashboardLayout>
      {(() => {
        if (!season) {
          return <PageLoader nav={true} />;
        }

        if (isSeasonTickets) {
          return <Route path="*" component={NotFound404} />;
        }

        return (
          <Container>
            <Content>
              <Route
                path={`${match.url}/details`}
                component={CreateSeasonDetails}
              />
              <Route
                path={`${match.url}/dates-times`}
                component={CreateSeasonDatesTimes}
              />
              <Route
                path={`${match.url}/ticket-types`}
                component={CreateEventTicketTypes}
              />
              {/* <Route
                path={`${match.url}/upgrade-types`}
                component={CreateEventUpgradeTypes}
              /> */}
              <Route
                path={`${match.url}/secret-codes`}
                component={CreateEventPromotions}
              />
              <Route
                path={`${match.url}/advanced-options`}
                component={CreateEventAdvancedOptions}
              />
              <CreateSeasonControls />
            </Content>
            <HideOnMobile>
              <CreateSeasonPreview />
            </HideOnMobile>
          </Container>
        );
      })()}
    </DashboardLayout>
  );
};

export default CreateSeasonContainer;
