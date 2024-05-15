import React from "react";
import styled from 'styled-components';
import { Colors, Icon, Icons } from '@sellout/ui';

const Container = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 15px;
  margin: 0px 0px 0px 15px;
  font-size: 1.2;
  color: ${Colors.White};
  font-weight: 500;
`;

type TopNavWarningProps = {
  children: String | React.ReactNode;
};

const TopNavWarning: React.FC<TopNavWarningProps> = ({ children }) => {
  return (
    <Container>
      <Icon
        icon={Icons.Warning}
        size={14}
        color={Colors.Yellow}
        margin="0px 10px 0px 0px"
      />
      <div>
        {children}
      </div>
    </Container>
  );
}

export default TopNavWarning;