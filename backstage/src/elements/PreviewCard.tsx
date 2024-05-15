import React from 'react';
import styled from 'styled-components';
import { Colors } from '@sellout/ui'
import { media } from '@sellout/ui/build/utils/MediaQuery';

type ContainerProps = {
  margin?: string;
  onClick?: Function;
  footer?: boolean;
}

const Container = styled.div<ContainerProps>`
  margin: ${(props) => props.margin};
  /* cursor: ${(props) => props.onClick ? 'pointer': null}; */
  box-sizing: border-box;
  transition: all 0.2s;
  transform: scale(1.05);

  ${media.desktop`
    width: 274px;
    height: ${(props: ContainerProps) => props.footer ? '250px' : '190px'};
    border-radius: 10px;
    border: 1px solid ${Colors.Grey5};
  `};

  ${media.mobile`
    height: ${(props: ContainerProps) => props.footer ? '280px' : '220px'};
    width: 100%;
    border-radius: 0px;
    border: 0;
  `};
`;

type PreviewCardPropTypes = {
  children: React.ReactNode;
  margin?: string;
  footer?: boolean;
  onClick?: Function;
};

const PreviewCard: React.FC<PreviewCardPropTypes> = ({ children, margin, onClick, footer }) => (
  <Container
    margin={margin}
    footer={footer}
    onClick={onClick ? () => onClick() : undefined}
  >
    {children}
  </Container>
);

export default PreviewCard;