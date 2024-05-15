import React from 'react';
import styled from 'styled-components';
import { Colors } from '@sellout/ui'
import { media } from '@sellout/ui/build/utils/MediaQuery';

type ContainerProps = {
  margin?: string;
  onClick?: Function;
}

const ImgDiv = styled.div<ImgProps>`
  position: relative;
  background-size: cover;
  background-position: center;
  background-origin: unset;
  background-image: url(${props => props.src});
  height: 100%;
  width: 100%;
  transition: all 0.2s;
`;

const OuterContainer = styled.div<ContainerProps>`
  overflow: hidden;
  margin: ${(props) => props.margin};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  ${media.desktop`
    width: 290px;
    height: 200px;
    border-radius: 10px;
  `};

  ${media.mobile`
    height: 140px;
    width: 175px;
    border-radius: 0px;
    border: 0;
  `};

  &:hover {
    background: ${Colors.Grey5};
  }

  &:hover ${ImgDiv} {
    transform: scale(1.05);
  }
`;

const Container = styled.div`
  position: relative;
  overflow: hidden;

  ${media.desktop`
    width: 280px;
    height: 190px;
    border-radius: 10px;
  `};

  ${media.mobile`
    height: 130px;
    width: 165px;
    border-radius: 0px;
    border: 0;
  `};
`;

const SmallContainer = styled.div`
  position: relative;
  overflow: hidden;
  width: 180px;
  height: 120px;
  border-radius: 10px;
`;

type ImgProps = {
  src: string;
};

const InfoContainer = styled.div<{ padding?: string }>`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: ${props => props.padding || '20px'};

  > div {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const Name = styled.div<{ size?: string }>`
  font-weight: 600;
  font-size: ${props => props.size || '2.4rem'};
  color: ${Colors.White};
`;

const Gradient = styled.div`
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 49.48%, rgba(0, 0, 0, 0.5) 100%);
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
`;

type TypeCardProps = {
  imageUrl: string;
  text: string
  onClick?: Function;
  margin?: string;
};

const TypeCard: React.FC<TypeCardProps> = ({
  imageUrl,
  text,
  onClick,
  margin,
}) => {
  return (
    <OuterContainer
      onClick={onClick ? () => onClick() : undefined}
      margin={margin}
    >
      <Container>
        <ImgDiv src={imageUrl} />
        <Gradient>
          <InfoContainer>
            <Name>
              {text}
            </Name>
          </InfoContainer>
        </Gradient>
      </Container>
    </OuterContainer>
  )
};

export const TypeCardNonInteractive: React.FC<TypeCardProps> = ({
  imageUrl,
  text,
  margin,
}) => {
  return (
    <SmallContainer>
      <ImgDiv src={imageUrl} />
      <Gradient>
        <InfoContainer padding="10px">
          <Name size="1.4rem">
            {text}
          </Name>
        </InfoContainer>
      </Gradient>
    </SmallContainer>
  )
};

export default TypeCard;