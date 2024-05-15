import React from 'react';
import styled from 'styled-components';
import { Colors } from '@sellout/ui';

const Container = styled.div`
  max-width: 100%;
  height: 70px;
  padding: 0px 20px;
  background: ${Colors.White};
  border-bottom: 1px solid ${Colors.Grey6};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

type PageHeaderProps = {
  renderLeft?: React.ReactNode
  renderRight?: React.ReactNode
}

const PageHeader: React.FC<PageHeaderProps> = ({ renderLeft, renderRight }) => {
  return (
    <Container>
      <div>
        {renderLeft}
      </div>
      <div>
        {renderRight}
      </div>
    </Container>
  );
}

export default PageHeader;
