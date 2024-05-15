import React from 'react';
import styled, { css } from 'styled-components';
import { Colors } from '@sellout/ui'
import IArtist from '@sellout/models/.dist/interfaces/IArtist';
import { media } from '@sellout/ui/build/utils/MediaQuery';

type ImgProps = {
  src: string;
};

const ImgDiv = styled.div<ImgProps>`
  background-size: cover;
  background-position: center;
  background-origin: unset;
  background-image: url(${props => props.src});
  height: 100%;
  width: 100%;
  transition: all 0.2s;

  ${media.desktop`
    border-radius: 10px;
  `};

  ${media.mobile`
    border-radius: 0px;
  `};
`;

const InfoContainer = styled.div`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 10px 15px;

  > div {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const Name = styled.div`
  font-weight: 600;
  font-size: 1.8rem;
  color: ${Colors.White};
  margin-bottom: 5px;
`;

const Type = styled.div`
  font-weight: 500;
  font-size: 1.2rem;
  color: ${Colors.White};
`;

const Gradient = styled.div`
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 49.48%, rgba(0, 0, 0, 0.5) 100%);
  height: 100%;
  width: 100%;
  border-radius: 10px;
  position: absolute;
`;

type ContainerProps = {
  margin?: string;
  onClick?: Function;
}

const ContainerCss = css<ContainerProps>`
  margin: ${(props) => props.margin};
  cursor: ${(props) => props.onClick ? 'pointer': null};
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
  display: flex;


  ${media.desktop`
    width: 274px;
    height: 192px;
    border-radius: 10px;
  `};

  ${media.mobile`
    height: 220px;
    width: 100%;
    border-radius: 0px;
    border: 0;
  `};
`;

const AnimatedContainer = styled.div`
  ${ContainerCss};
  &:hover ${ImgDiv} {
    transform: scale(1.05);
  }
`;

const UnanimatedContainer = styled.div`
  ${ContainerCss};
`;

type ArtistCardPropTypes = {
  artist: IArtist;
  onClick?: Function;
  margin?: string;
};

const ArtistCard: React.FC<ArtistCardPropTypes> = ({ artist, onClick, margin }) => {
  const Container: any = onClick ? AnimatedContainer : UnanimatedContainer;
  return (
    <Container
      margin={margin}
      onClick={onClick ? () => onClick() : undefined}
    >
      <ImgDiv src={artist.pressKits[0].posterImageUrls[0]} />
        <Gradient>
          <InfoContainer>
            <Name>
              {artist.name}
            </Name>
            <Type>
              {artist?.type}
            </Type>
          </InfoContainer>
        </Gradient>
    </Container>
  )
};

export default ArtistCard;
