import React, { Fragment } from "react";
import styled from "styled-components";
import { useQuery } from "@apollo/react-hooks";
import GET_WEBFLOW from "@sellout/models/.dist/graphql/queries/webflow.query";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../redux/store";
import * as AppActions from "../../redux/actions/app.actions";
import * as EventActions from "../../redux/actions/event.actions";
import Button, {
  ButtonTypes,
  ButtonStates,
} from "@sellout/ui/build/components/Button";
import Loader, { LoaderSizes } from "@sellout/ui/build/components/Loader";
import Label from "@sellout/ui/build/components/Label";
import Flex from "@sellout/ui/build/components/Flex";
import { Icons, Colors, Icon } from "@sellout/ui";
import Error from "../../elements/Error";
import Toggle from "../../elements/Toggle";
import useEvent from "../../hooks/useEvent.hook";
import EventCard, { EventCardTypes } from "../../components/EventCard";
import {
  ModalContainer,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "./Modal";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import * as Time from "@sellout/utils/.dist/time";
import {
  IWebFlowEntityId,
  IWebFlowSite,
} from "@sellout/models/.dist/interfaces/IWebFlow";
import EventIsNotSynced from "../../components/EventIsNotSynced";
import EventUtil from "@sellout/models/.dist/utils/EventUtil";

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

const PublishEventModal: React.FC = () => {

  /* Hooks */
  const { event } = useEvent();
  // const [seasonValidationErrors, setSeasonValidationErrors] = useState(
  //   "" as string
  // );
  let seasonValidationErrors = "" as string;
  /* State */
  let currentlyPublishedSites =
    event?.webFlowEntity?.webFlowIds.map(
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
  const announceAt = event?.schedule?.announceAt ?? Infinity;
  const isAnnounced = announceAt < Time.now();
  const validate = EventUtil.validatePublish(event as IEventGraphQL);
  const validationErrors =
    validate?.error?.details?.map((detail: any) => detail.message) ?? [];
  // console.log(event,'..............event')

  const venueState = useSelector((state: BackstageState) => state.venue);
  const { venuesCache } = venueState;
  const venueId = event?.venueId as string;
  const venue = venuesCache[venueId];
  const timezone =
    venue && venue.address && venue.address.timezone != ""
      ? venue.address.timezone
      : event?.venue?.address?.timezone;
  let confirmText = "PUBLISH NOW";
  let titleText = "Publish event";

  if (event?.published) {
    confirmText = "UPDATE NOW";
    titleText = "Update event";
  }

  if (!isAnnounced) {
    confirmText = "SCHEDULE NOW";
    titleText = "Schedule event";
  }

  if (validationErrors.length || errorMsg) {
    confirmText = "CLOSE";
    titleText = "Cannot Publish";
  }

  /* GraphQL */
  const { data, loading, error } = useQuery(GET_WEBFLOW, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (
        currentlyPublishedSites.length === 0 &&
        data?.webFlow?.sites[0]?.webFlowId &&
        !event?.published
      ) {
        setPublishSiteIds([data?.webFlow?.sites[0]?.webFlowId]);
      }
    },
  });

  /* Actions */
  const dispatch = useDispatch();
  const popModal = () => dispatch(AppActions.popModal());
  const publishEvent = () =>
    dispatch(EventActions.publishEvent(publishSiteIds, unpublishSiteIds));

  /* Render */
  return (
    <ModalContainer>
      <ModalHeader title={titleText} close={popModal} />
      <ModalContent>
        <Container>
          {(() => {
            if (!event || !data || loading) {
              return (
                <Flex justify="center" align="center" height="400px">
                  <Loader color={Colors.Orange} size={LoaderSizes.Large} />
                </Flex>
              );
            }

            const ticketsAt = event.schedule?.ticketsAt;
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
                <EventCard
                  event={event as IEventGraphQL}
                  margin="0 0 20px 0"
                  footer={false}
                  type={EventCardTypes.Modal}
                />

                {(() => {
                  if (seasonValidationErrors.length > 0) {
                    return (
                      <Flex align="center" margin={"0 0 16px 0"}>
                        <Icon
                          icon={Icons.Warning}
                          color={Colors.Yellow}
                          margin="0 8px 0 0"
                          size={14}
                        />
                        <ValidationText>
                          {seasonValidationErrors}
                        </ValidationText>
                      </Flex>
                    );
                  }
                })()}

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

                  if (errorMsg) {
                    return (
                      <Flex
                        align="center"
                        margin={"0 0 16px 0"}
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
                      {!event.published && (
                        <Box>
                          <Label text="On Sale" margin="0 0 4px" />
                          <DateText margin>{onSale}</DateText>
                          <Label text="Announcement" margin="0 0 4px" />
                          <DateText>{announcement}</DateText>
                        </Box>
                      )}
                      <Label text="Sync event to:" />
                      {data.webFlow.sites.map(
                        (site: IWebFlowSite, index: number) => {
                          return (
                            <Box key={index}>
                              <Flex align="center">
                                <Toggle
                                  active={publishSiteIds.includes(
                                    site.webFlowId
                                  )}
                                  onChange={() => {
                                    if (
                                      publishSiteIds.includes(site.webFlowId)
                                    ) {
                                      // Remove from publish
                                      setPublishSiteIds(
                                        publishSiteIds.filter(
                                          (siteId) => siteId !== site.webFlowId
                                        )
                                      );

                                      // Add to unpublish
                                      if (
                                        currentlyPublishedSites.includes(
                                          site.webFlowId
                                        )
                                      ) {
                                        setUnpublishSiteIds([
                                          ...unpublishSiteIds,
                                          site.webFlowId,
                                        ]);
                                      }
                                    } else {
                                      // Add to publish
                                      setPublishSiteIds([
                                        ...publishSiteIds,
                                        site.webFlowId,
                                      ]);
                                      // remove from unpublish
                                      setUnpublishSiteIds(
                                        unpublishSiteIds.filter(
                                          (siteId) => siteId !== site.webFlowId
                                        )
                                      );
                                    }
                                  }}
                                />
                                <SiteName>{site.name}</SiteName>
                              </Flex>
                              {Boolean(site?.domains?.length) && (
                                <SiteUrl>
                                  https://{site.domains[0].name}
                                </SiteUrl>
                              )}
                            </Box>
                          );
                        }
                      )}
                      {publishSiteIds.length === 0 && <EventIsNotSynced />}
                    </Fragment>
                  );
                })()}

              </Fragment>
            );
          })()}
        </Container>
      </ModalContent>
      <ModalFooter>
        <div />
        <ButtonContainer>
          {validationErrors.length === 0 && !errorMsg && (
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
              if (validationErrors.length || errorMsg) {
                popModal();
              } else {
                publishEvent();
              }
            }}
          />
        </ButtonContainer>
      </ModalFooter>
    </ModalContainer>
  );
};

export default PublishEventModal;
