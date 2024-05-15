import React from 'react';
import styled from 'styled-components';
import { Colors, Icons } from '@sellout/ui';
import DetailsCard from '../elements/DetailsCard';
import useVenue from '../hooks/useVenue.hook';

const Section = styled.div`
  margin-bottom: 30px;
  &:last-of-type {
    margin-bottom: 0px;
  }
  /* margin: 20px 0px 10px; */
`;

const SectionHeader = styled.div`
  font-weight: 600;
  color: ${Colors.Grey1};
  font-size: 1.4rem;
  margin-bottom: 5px;
`;

const SectionBody = styled.div`
  font-weight: 500;
  color: ${Colors.Grey2};
  font-size: 1.4rem;
  word-break: break-all;
`;

type VenueInformationCardProps = {};
const VenueInformationCard: React.FC<VenueInformationCardProps> = () => {
  const { venue } = useVenue();
  const a = venue?.address;
  const address1 = `${a?.address1}`;
  const address2 = `${a?.city}, ${a?.state}, ${a?.zip}`

  return (
    <DetailsCard
      title="Venue Information"
      headerIcon={Icons.GraphGrowth}
      width="375px"
    >
      {venue?.address && (
        <Section>
          <SectionHeader>
            Address
          </SectionHeader>
          <SectionBody>
            {address1}
          </SectionBody>
          <SectionBody>
            {address2}
          </SectionBody>
        </Section>
      )}
      {/* {venue?.capacity && (
        <Section>
          <SectionHeader>
            Total Capacity
          </SectionHeader>
          <SectionBody>
            {venue?.capacity}
          </SectionBody>
        </Section>
      )} */}
      {venue?.url && (
        <Section>
          <SectionHeader>
            Venue Website
          </SectionHeader>
          <SectionBody>
            {venue?.url}
          </SectionBody>
        </Section>
      )}
      {venue?.tax && (
        <Section>
          <SectionHeader>
            Sales Tax
          </SectionHeader>
          <SectionBody>
            {parseFloat(venue?.tax).toFixed(2)}%
          </SectionBody>
        </Section>
      )}
    </DetailsCard>
  );
};

export default VenueInformationCard;