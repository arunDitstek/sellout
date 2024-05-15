import React from "react";
import { Colors, Icon, Icons } from "@sellout/ui";
import Flex from "@sellout/ui/build/components/Flex"
import CreateArtistName from "../../components/create-artist/CreateArtistName";
import CreateArtistPosterImage from "../../components/create-artist/CreateArtistPosterImage";
import CreateArtistDescription from "../../components/create-artist/CreateArtistDescription";
import CreateArtistSwitchType from "../../components/create-artist/CreateArtistSwitchType";
import {
  Container,
  Content,
  Title,
  TitleContainer,
  Subtitle,
  Spacer,
} from '../../components/create-flow/CreateFlowStyles';
type CreateArtistDetailsProps = {};

const CreateArtistDetails: React.FC<CreateArtistDetailsProps> = () => {
  /* Render */
  return (
    <Container>
      <Content>
        <TitleContainer>
          <Flex align="center">
            <Title>Performer details details</Title>
            <Icon
              icon={Icons.HelpSolid}
              size={18}
              top="3px"
              color={Colors.Grey5}
              margin="0 0 0 8px"
              onClick={() => window.open('http:s//help.sellout.io/en/articles/4453911-creating-editing-performers', '_blank')}
            />
          </Flex>
          <Subtitle>Fill in some heads up information about this performer.</Subtitle>
        </TitleContainer>
        <CreateArtistSwitchType />
        <Spacer />
        <CreateArtistName width="500px"/>
        <Spacer />
        <CreateArtistPosterImage />
        <Spacer />
        <CreateArtistDescription />
        <Spacer />
      </Content>
    </Container>
  );
};

export default CreateArtistDetails;
