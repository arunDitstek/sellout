import React, { Fragment } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../redux/store";
import * as AppActions from "../../redux/actions/app.actions";
import Button, {
  ButtonTypes,
  ButtonStates,
} from "@sellout/ui/build/components/Button";
import Loader, { LoaderSizes } from "@sellout/ui/build/components/Loader";
import Label from "@sellout/ui/build/components/Label";
import Flex from "@sellout/ui/build/components/Flex";
import { Icons, Colors, Icon } from "@sellout/ui";
import Error from "../../elements/Error";
import {
  ModalContainer,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "./Modal";
import * as Time from "@sellout/utils/.dist/time";
import {
  IWebFlowEntityId,
} from "@sellout/models/.dist/interfaces/IWebFlow";
import SeasonUtil from "@sellout/models/.dist/utils/SeasonUtil";
import * as SeasonActions from "../../redux/actions/season.actions";
import useSeason from "../../hooks/useSeason.hook";
import SeasonCard, { SeasonCardTypes } from "../SeasonCard";
import { ISeasonGraphQL } from "@sellout/models/.dist/interfaces/ISeason";

const Container = styled.div`
  width: 375px;
  @media(max-width:767px){
    width: initial;
  }
`;

const Box = styled.div`
  background-color: ${Colors.White};
  padding: 16px;
  border: 1px solid ${Colors.Grey5};
  border-radius: 8px;
  margin-bottom: 16px;

  :last-of-type {
    margin-bottom: 0px;
  }
`;

type TextProps = {
  margin?: boolean;
};

const ValidationText = styled.div`
  font-size: 1.4rem;
  font-weight: 500;
  color: ${Colors.Grey1};
`;

const DateText = styled.div<TextProps>`
  font-size: 1.4rem;
  font-weight: 500;
  color: ${Colors.Grey2};
  margin-bottom: ${(props) => (props.margin ? "16px" : null)};
`;

const SiteName = styled.div`
  font-size: 1.8rem;
  font-weight: 600;
  color: ${Colors.Grey1};
  margin-left: 8px;
`;

const SiteUrl = styled.div<TextProps>`
  font-size: 1.4rem;
  font-weight: 500;
  color: ${Colors.Grey2};
  margin-left: 28px;
`;

const ButtonContainer = styled.div`
  display: flex;
`;

export const joiToErrorMessages = (joiErrors: any, errorClass: any) => {
  const errors = joiErrors.details.map((detail: any) => {
    const key = detail.context.label;
    const message = detail.message;
    return new errorClass({ key, message });
  }, {});
  return errors;
};

const PublishSeasonModal: React.FC = () => {
  /* Hooks */
  const { season, seasonId } = useSeason();

  /* State */
  let currentlyPublishedSites =
    season?.webFlowEntity?.webFlowIds.map(
      (webFlowId: IWebFlowEntityId) =>
        (webFlowId.webFlowSite?.webFlowId as string) ?? undefined
    ) ?? [];

  currentlyPublishedSites = currentlyPublishedSites.filter((siteId) =>
    Boolean(siteId)
  );

  const [publishSiteIds, setPublishSiteIds] = React.useState<string[]>(
    currentlyPublishedSites
  );
  const [unpublishSiteIds, setUnpublishSiteIds] = React.useState<string[]>([]);
  const { errorMsg, publishing } = useSelector(
    (state: BackstageState) => state.event
  );

  const announceAt = season?.schedule?.announceAt ?? Infinity;
  const isAnnounced = announceAt < Time.now();
  const validate = SeasonUtil.validatePublish(season as ISeasonGraphQL);
  const validationErrors =
    validate?.error?.details?.map((detail: any) => detail.message) ?? [];
  const venueState = useSelector((state: BackstageState) => state.venue);
  const { venuesCache } = venueState;
  const venueId = season?.venueId as string;
  const venue = venuesCache[venueId];
  const timezone =
    venue && venue.address && venue.address.timezone != ""
      ? venue.address.timezone
      : season?.venue?.address?.timezone;
  let confirmText = "PUBLISH NOW";
  let titleText = "Publish season";

  if (season?.published) {
    confirmText = "UPDATE NOW";
    titleText = "Update season";
  }

  if (!isAnnounced) {
    confirmText = "SCHEDULE NOW";
    titleText = "Schedule season";
  }

  if (validationErrors.length) {
    confirmText = "CLOSE";
    titleText = "Cannot Publish";
  }

  /* Actions */
  const dispatch = useDispatch();
  const popModal = () => dispatch(AppActions.popModal());
  const publishSeason = () => {
    dispatch(SeasonActions.publishSeason());
  };

  /* Render */
  return (
    <ModalContainer>
      <ModalHeader title={titleText} close={popModal} />
      <ModalContent>
        <Container>
          {(() => {
            if (!season) {
              return (
                <Flex justify="center" align="center" height="400px">
                  <Loader color={Colors.Orange} size={LoaderSizes.Large} />
                </Flex>
              );
            }

            const ticketsAt = season?.schedule?.ticketsAt;
            const onSale =
              (ticketsAt ?? 0) > Time.now()
                ? Time.format(
                    ticketsAt,
                    "ddd, MMM DD, YYYY [at] h:mma",
                    timezone
                  )
                : "Immediately";
            const announcement = !isAnnounced
              ? Time.format(
                  announceAt,
                  "ddd, MMM DD, YYYY [at] h:mma",
                  timezone
                )
              : "Immediately";

            return (
              <Fragment>
                <SeasonCard
                  season={season}
                  margin="0 0 20px 0"
                  footer={false}
                  type={SeasonCardTypes.Modal}
                />
                {(() => {
                  if (validationErrors.length) {
                    return validationErrors.map(
                      (errorMsg: string, index: number) => {
                        return (
                          <Flex
                            align="center"
                            margin={
                              index != validationErrors.length - 1
                                ? "0 0 16px 0"
                                : undefined
                            }
                          >
                            <Icon
                              icon={Icons.Warning}
                              color={Colors.Yellow}
                              margin="0 8px 0 0"
                              size={14}
                            />
                            <ValidationText>{errorMsg}</ValidationText>
                          </Flex>
                        );
                      }
                    );
                  }

                  if (publishing) {
                    return (
                      <Flex justify="center" align="center" height="246px">
                        <Loader
                          color={Colors.Orange}
                          size={LoaderSizes.Large}
                        />
                      </Flex>
                    );
                  }

                  return (
                    <Fragment>
                      {!season.published && (
                        <Box>
                          <Label text="On Sale" margin="0 0 4px" />
                          <DateText margin>{onSale}</DateText>
                          <Label text="Announcement" margin="0 0 4px" />
                          <DateText>{announcement}</DateText>
                        </Box>
                      )}
                    </Fragment>
                  );
                })()}
                {errorMsg && (
                  <Error children={errorMsg} margin="16px 0px 0px" />
                )}
              </Fragment>
            );
          })()}
        </Container>
      </ModalContent>
      <ModalFooter>
        <div />
        <ButtonContainer>
          {validationErrors.length === 0 && (
            <Button
              type={ButtonTypes.Thin}
              text="CANCEL"
              state={ButtonStates.Warning}
              margin="0px 10px 0px 0px"
              onClick={() => {
                popModal();
              }}
            />
          )}
          <Button
            type={ButtonTypes.Thin}
            text={confirmText}
            state={ButtonStates.Active}
            onClick={() => {
              if (validationErrors.length) {
                popModal();
              } else {
                publishSeason();
              }
            }}
          />
        </ButtonContainer>
      </ModalFooter>
    </ModalContainer>
  );
};

export default PublishSeasonModal;
