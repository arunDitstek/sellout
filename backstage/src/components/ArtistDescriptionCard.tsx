import React from 'react';
import styled from 'styled-components';
import { Colors, Icons } from '@sellout/ui';
import DetailsCard from '../elements/DetailsCard';
import useArtist from '../hooks/useArtist.hook';

const Text = styled.div`
  font-family: "neue-haas-grotesk-display", sans-serif;
  padding: 0px;
  font-weight: 500;
  font-size: 1.4rem;
  color: ${Colors.Grey1};
`;

type ArtistDescriptionCardProps = {};
const ArtistDescriptionCard: React.FC<ArtistDescriptionCardProps> = () => {
  let { artist } = useArtist();

  return (
    <DetailsCard
      title="Perfomer Bio"
      headerIcon={Icons.GraphGrowth}
      width="600px"
    >
      <Text dangerouslySetInnerHTML={{ __html: artist?.pressKits[0]?.description as string }} />
    </DetailsCard>
  );
};

export default ArtistDescriptionCard;