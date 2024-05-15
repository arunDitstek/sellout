import React from "react";
import { Colors, Flex, Icon, Icons } from "@sellout/ui";
import CreateVenueName from "../../components/create-venue/CreateVenueName";
import CreateVenueAddress from "../../components/create-venue/CreateVenueAddress";
import CreateVenuePosterImage from "../../components/create-venue/CreateVenuePosterImage";
import CreateVenueDescription from "../../components/create-venue/CreateVenueDescription";
import CreateVenueUrl from "../../components/create-venue/CreateVenueUrl";
import CreateVenueTax from "../../components/create-venue/CreateVenueTaxPercentage";
import {
  Container,
  Content,
  Title,
  TitleContainer,
  Subtitle,
  Spacer,
} from '../../components/create-flow/CreateFlowStyles'; import styled from "styled-components";
import { media } from "@sellout/ui/build/utils/MediaQuery";
http://localhost:3000/create-season/details?seasonId=Y1Rp3Ei6Qz


type CreateVenueDetailsProps = {};

const CreateVenueNameWrapper = styled.div`
width: 100%;
  ${media.mobile`
    width: 0;
  `};
`;
const CreateVenueDetails: React.FC<CreateVenueDetailsProps> = () => {
  /* Render */
  return (
    <Container>
      <Content>
        <TitleContainer>
          <Flex align="center">
            <Title>Venue details</Title>
            <Icon
              icon={Icons.HelpSolid}
              size={18}
              top="3px"
              color={Colors.Grey5}
              margin="0 0 0 8px"
              onClick={() => window.open('https://help.sellout.io/en/articles/4453896-creating-a-new-venue', '_blank')}
            />
          </Flex>
          <Subtitle>Fill in the basic information about this venue.</Subtitle>
        </TitleContainer>
          <CreateVenueName/>
        <Spacer />
        <CreateVenueAddress  />
        <Spacer />
        <CreateVenuePosterImage />  
        <Spacer />
        <CreateVenueDescription />
        <Spacer />
        <CreateVenueUrl/>
        <Spacer />
        <CreateVenueTax  />
        <Spacer />
      </Content>
    </Container>
  );
};

export default CreateVenueDetails;
