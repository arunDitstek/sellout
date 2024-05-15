import React from "react";
import styled from "styled-components";
import { Icon, Colors } from '@sellout/ui';
import { media } from "@sellout/ui/build/utils/MediaQuery";


type ContainerProps = {
  width?: string;
}

const Container = styled.div<ContainerProps>`
  width: ${props => props.width || '100%'};
  background:  ${Colors.White};
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  border: 1px solid ${Colors.Grey5};
  margin: 0px 24px 24px 0px;
  ${media.mobile`
    width: 100%;
    box-sizing: border-box;
    margin: 0px 0 24px 0px;
    
  `};
`;

const Header = styled.div`
  border-radius: 10px 10px 0px 0px;
  display: flex;
  height: 50px;
  align-items: center;
  padding: 0px 15px;
  border-bottom: 1px solid ${Colors.Grey6};
`;

type BodyProps = {
  padding?: string;
}
const Body = styled.div<BodyProps>`
  border-radius: 0px 0px 10px 10px;
  padding: ${props => props.padding || '20px'};
`;

export const Title = styled.div`
  margin-left: 10px;
  font-weight: 600;
  color: ${Colors.Grey1};
  font-size: 1.4rem;
`;
export const className = styled.div`
 
`;
type DetailsCardProps = {
  children: React.ReactNode;
  title: string | React.ReactNode;
  headerIcon: any;
  width?: string;
  padding?: string;
  className?:string
};

const DetailsCard: React.FC<DetailsCardProps> = ({
  children,
  title,
  headerIcon,
  width,
  padding,
  className
 }) => {
  return (
    <Container
      width={width}
      className={className}
    >
      <Header>
        <Icon
          icon={headerIcon}
          color={Colors.Grey1}
          size={14}
        />
        {typeof title === 'string' ? (
          <Title>
            {title}
          </Title>
        ) : title}
      </Header>
      <Body padding={padding}>
        {children}
      </Body>
    </Container>
  );
};

export default DetailsCard;
