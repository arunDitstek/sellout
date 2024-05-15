import React, { Fragment } from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import * as AppActions from "../../redux/actions/app.actions";
import Button, { ButtonTypes, ButtonStates } from '@sellout/ui/build/components/Button';
import Loader, { LoaderSizes } from "@sellout/ui/build/components/Loader";
import Label from "@sellout/ui/build/components/Label";
import Flex from "@sellout/ui/build/components/Flex";
import { Colors } from '@sellout/ui';
import useEvent from "../../hooks/useEvent.hook";
import EventCard, { EventCardTypes } from '../../components/EventCard';
import {
  ModalContainer,
  ModalHeader,
  ModalContent,
} from "./Modal";
import  { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import { IWebFlowEntityId } from "@sellout/models/.dist/interfaces/IWebFlow";
import EventIsNotSynced from '../../components/EventIsNotSynced';
import useNavigateToEventDetails from '../../hooks/useNavigateToEventDetails.hook';
import ISaveChanges from "../../models/interfaces/ISaveChanges";


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

const SiteName = styled.div`
  font-size: 1.8rem;
  font-weight: 600;
  color: ${Colors.Grey1};
`;

const SiteUrl = styled.a`
  font-size: 1.4rem;
  font-weight: 500;
  color: ${Colors.Grey2};
  text-decoration: none;
`;

const ButtonContainer = styled.div`
  display: flex;
  margin-top: 16px;
`;

const EventPublishedModal: React.FC = () => {
  /* Hooks */
  const { event } = useEvent("", true);
  const navigateToEventDetails = useNavigateToEventDetails();
  /* Actions */
  const dispatch = useDispatch();
  const popModal = () => {
    dispatch(AppActions.setSaveChanges({
      hasChanges: false,
      saveChanges: null,
      discardChanges: null,
      nextUrl: null,
      message: '',
      title: '',
      confirmText: '',
      cancelText: ''
    } as ISaveChanges));
    dispatch(AppActions.popModal())
  }

  /* Render */
  return (
    <ModalContainer>
      <ModalHeader title="Publish successful" close={popModal} />
      <ModalContent>
        <Container>
          {(() => {
            if (!event) {
              return (
                <Flex justify="center" align="center" height="400px">
                  <Loader color={Colors.Orange} size={LoaderSizes.Large} />
                </Flex>
              );
            }

            console.log(event?.webFlowEntity?.webFlowIds.length);

            return (
              <Fragment>
                <EventCard
                  event={event as IEventGraphQL}
                  margin="0 0 20px 0"
                  footer={false}
                  type={EventCardTypes.Modal}
                />
                {(() => {
                  return (
                    <Fragment>
                      <Label text="Congratulations! Your event has been published." />
                      {event?.webFlowEntity?.webFlowIds.map((webFlowId: IWebFlowEntityId, index: number) => {
                        const url = Boolean(webFlowId?.webFlowSite?.domains[0]?.name) ? `https://${webFlowId?.webFlowSite?.domains[0]?.name}/events/${webFlowId?.slug}` : '';
                        return (
                          <Box key={index}>
                            <SiteName>{webFlowId?.webFlowSite?.name}</SiteName>
                            {Boolean(url) && <SiteUrl href={url} target="_blank">{url}</SiteUrl>}
                          </Box>
                        );
                      })}
                      {(event?.webFlowEntity?.webFlowIds.length ?? 0) === 0 && (
                        <EventIsNotSynced
                          navigateToEmbedInstructions={() => {
                            popModal();
                            navigateToEventDetails(event._id, '/sharing');
                          }}
                        />
                      )}
                    </Fragment>
                  );
                })()}
              </Fragment>
            );
          })()}
        </Container>
        <ButtonContainer>
          <Button
            type={ButtonTypes.Next}
            text="VIEW EVENT DASHBOARD"
            state={ButtonStates.Active}
            onClick={() => {
              popModal();
            }}
          />
        </ButtonContainer>
      </ModalContent>
    </ModalContainer>
  );
};

export default EventPublishedModal;