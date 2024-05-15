import React from "react";
import styled from "styled-components";
import CreateEventFees from "../../components/create-event/CreateEventFees";
import CreateEventCustomFields from "../../components/create-event/CreateEventCustomFields";
import CreateEventUserAgreement from "../../components/create-event/CreateEventUserAgreement";
import CreateEventSaveButton from "../../components/create-event/CreateEventSaveButton";
import { Colors, Flex, Icons, Icon } from "@sellout/ui";
import {
  Container,
  Content,
  Title,
  TitleContainer,
  Subtitle,
  Spacer,
} from "../../components/create-flow/CreateFlowStyles";

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: ${Colors.Grey6};
`;

type CreateEventAdvancedOptionsProps = {};

const CreateEventAdvancedOptions: React.FC<
  CreateEventAdvancedOptionsProps
> = () => {
  const firstPath = window.location.pathname.split("/")[1];
  const isEvent = firstPath === "create-event";

  return (
    <Container>
      <Content>
        <TitleContainer>
          <Flex align="center">
            <Title>Advanced Options</Title>
            <Icon
              icon={Icons.HelpSolid}
              size={18}
              top="3px"
              color={Colors.Grey5}
              margin="0 0 0 8px"
              onClick={() =>
                window.open(
                  "https://help.sellout.io/en/articles/4446519-advanced-options",
                  "_blank"
                )
              }
            />
          </Flex>
          <Subtitle>
            Additional advanced options add another layer of customization for
            your {isEvent ? "event" : "season"}.
          </Subtitle>
        </TitleContainer>
        <CreateEventFees />
        <Divider />
        <Spacer />
        <CreateEventCustomFields />
        <Divider />
        <Spacer />
        <CreateEventUserAgreement />
        {/* <Spacer /> */}
        {/* <Divider /> */}
        {/* <Spacer />
        <CreateEventSaveButton /> */}
        <Spacer />
      </Content>
    </Container>
  );
};

export default CreateEventAdvancedOptions;
