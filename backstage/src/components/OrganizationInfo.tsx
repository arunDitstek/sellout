import React from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';
import gql from "graphql-tag";
import { Colors } from '@sellout/ui';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 5px;
  margin-bottom: 30px;
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 10px;
`;

const Name = styled.div`
  font-size: 1.4rem;
  line-height: 1.7rem;
  font-weight: 600;
  color: ${Colors.White};
`;

const Location = styled.div`
  font-size: 1.2rem;
  line-height: 1.4rem;
  font-weight: 500;
  color: ${Colors.White};
`;

type ImageProps = {
  src: string | null
};

const Image = styled.div<ImageProps>`
  height: 36px;
  width: 36px;
  border-radius: 50%;
  background-image: url('${props => props.src}');
  background-size: cover;
  background-origin: center;
  background-position: center center;
`;

const ORGANIZATION_SUMMARY = gql`
  query {
    organization {
      orgName
      orgLogoUrl
      address {
        city
        state
      }
    }
  }
`;

type OrganizationInfoProps = {};

const OrganizationInfo: React.FC<OrganizationInfoProps> = () => {
  const { data, loading, error } = useQuery(ORGANIZATION_SUMMARY);

  if(!data) return null;

  const {
    organization: {
      orgName,
      orgLogoUrl,
      address: {
        city,
        state
      }
    }
  } = data;

  return (
    <Container>
      <Image src={orgLogoUrl} />
      <Info>
        <Name>{orgName}</Name>
        <Location>{city}, {state}</Location>
      </Info>
    </Container>
  );
};

export default OrganizationInfo;
