import React from 'react';
import styled, { css } from 'styled-components';
import { Colors, Icon, Icons } from '@sellout/ui'
import IVenue from '@sellout/models/.dist/interfaces/IVenue';
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
`;

const Name = styled.div`
  font-weight: 600;
  font-size: 1.8rem;
  color: ${Colors.White};
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Flexy = styled.div`
  display: flex;
  align-items: center;

  > div {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
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

type PropTypes = {
  venue: IVenue;
  onClick?: Function;
  margin?: string;
};

const VenueCard: React.FC<PropTypes> = ({ venue, onClick, margin }) => {
  const a = venue.address;
  const venueAddress = `${a.address1}${a.address2 ? `, ${a.address2}` : ''}, ${a.city}, ${a.state} ${a.zip}`;
  const Container: any = onClick ? AnimatedContainer : UnanimatedContainer;
  return (
    <Container
      margin={margin}
      onClick={onClick ? () => onClick() : undefined}
    >
      <ImgDiv src={venue?.imageUrls ? venue.imageUrls[0] : ''} />
        <Gradient>
          <InfoContainer>
            <Name>
              {venue.name}
            </Name>
            <Flexy>
              <Icon
                icon={Icons.MapPinLight}
                size={12}
                margin="0px 5px 0px 0px"
                color={Colors.White}
              />
              <Type>
                {venueAddress}
              </Type>
            </Flexy>
          </InfoContainer>
        </Gradient>
    </Container>
  )
};

export default VenueCard;
