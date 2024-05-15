import React from 'react';
import styled from 'styled-components';
import { Colors, Icons } from '@sellout/ui';
import DetailsCard from '../elements/DetailsCard';
import useVenue from '../hooks/useVenue.hook';

const Text = styled.div`
  font-family: "neue-haas-grotesk-display", sans-serif;
  padding: 0px;
  font-weight: 500;
  font-size: 1.4rem;
  color: ${Colors.Grey1};
`;

type VenueDescriptionCardProps = {};
const VenueDescriptionCard: React.FC<VenueDescriptionCardProps> = () => {
  let { venue } = useVenue();
  return (
    <DetailsCard
      title="Venue Description"
      headerIcon={Icons.GraphGrowth}
      width="600px"
    >
      <Text dangerouslySetInnerHTML={{ __html: venue?.description as string }} />
    </DetailsCard>
  );
};

export default VenueDescriptionCard;