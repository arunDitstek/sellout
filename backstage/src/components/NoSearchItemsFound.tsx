import React from 'react';
import styled from 'styled-components';
import { Colors } from '@sellout/ui';

const HeaderText = styled.div`
  font-weight: 600;
  font-size: 1.8rem;
  color: ${Colors.Grey1};
  margin-bottom: 5px;
`;

const HelpText = styled.div`
  font-weight: 500;
  font-size: 1.8rem;
  color: ${Colors.Grey3};
`;

const NoSearchItemsFound: React.FC = () => (
  <>
    <HeaderText>
      No results found
    </HeaderText>
    <HelpText>
      Try different search terms or filters
    </HelpText>
  </>
);

export default NoSearchItemsFound;
