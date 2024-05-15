import React from "react";
import styled from "styled-components";
import { Colors } from '@sellout/ui';
import Icon, { Icons } from '@sellout/ui/build/components/Icon';
import TextButton, { TextButtonSizes } from '@sellout/ui/build/components/TextButton';
import useSeason from "../hooks/useSeason.hook";

type ContainerProps = {
    margin?: string;
}

const Container = styled.div<ContainerProps>`
  background-color: ${Colors.Grey6};
  padding: 16px;
  border-radius: 10px;
  display: flex;
`;

const Text = styled.div`
  font-size: 1.4rem;
  font-weight: 500;
  color: ${Colors.Grey1};
  line-height: 2rem;
  margin-left: 8px;
`;

type SeasonIsNotSyncedProps = {
    navigateToEmbedInstructions?: Function;
};

const SeasonIsNotSynced: React.FC<SeasonIsNotSyncedProps> = ({
    navigateToEmbedInstructions
}) => {
    const { season } = useSeason();
    return (
        <Container>
            <Icon icon={Icons.Warning} color={Colors.Yellow} size={14} />
            {!season?.publishable && <Text>
                This season is not being synced to any sites. The Buy Button will need to be embedded in order to sell tickets.
                {navigateToEmbedInstructions && (
                    <TextButton
                        size={TextButtonSizes.Regular}
                        onClick={() => navigateToEmbedInstructions ? navigateToEmbedInstructions() : null}
                    >
                        Click here to get embed instructions
                    </TextButton>
                )}
            </Text>}
            {season?.publishable && <Text>
                This season will be published on Sellout.io between the announcement date and the end date of the season. If you wish to stop this season from displaying on Sellout.io, edit the season and change the setting on the Season Details tab.
            </Text>}
        </Container>
    );
};

export default SeasonIsNotSynced;