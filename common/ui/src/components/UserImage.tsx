import React from 'react';
import styled from 'styled-components';
import { Colors } from "../Colors";
import Icon, { Icons } from './Icon';

type ImageProps = {
  src?: string;
  height?: string;
  margin?: string;
  circle?: boolean;
  invert?: boolean;
  size?: string;
};
const UserImageDiv = styled.div<ImageProps>`
  background-color: ${props => {
    if(props.src) {
      if(props.invert) {
        return Colors.Grey6;
      } else {
        return Colors.Grey6;
      }
    } else if(props.invert){
        return Colors.White;
    } else {
      return Colors.Grey1;
    }
  }};
  height: ${props => props.height};
  width: ${props => props.height};
  min-height: ${props => props.height};
  min-width: ${props => props.height};
  border-radius: ${props => (props.circle ? '50%' : '0')};
  color: ${props => (props.invert ? Colors.Grey1 : Colors.White)};
  font-size: ${props => props.size};
  font-weight: 600;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: ${props => props.margin || '0px 10px 0px 0px'};
  background-image: ${props => `url(${props.src})`};
  background-position: center;
  background-size: cover;
`;

type PropTypes = {
  imageUrl?: string;
  height?: string;
  size?: string;
  firstName: string;
  lastName: string;
  margin?: string;
  invert?: boolean;
  circle?: boolean;
};
const UserImage: React.FC<PropTypes> = ({
  imageUrl,
  height = '45px',
  size = '1.8rem',
  firstName,
  lastName,
  margin,
  invert,
  circle = true,
}) => {
  if (!imageUrl) {
    let userInitials = '';

    if (firstName && lastName) {
      userInitials = `${firstName.split('')[0]}${lastName.split('')[0]}`;
    }

    return (
      <UserImageDiv
        height={height}
        margin={margin}
        invert={invert}
        size={size}
        circle={circle}
      >
        {userInitials ? userInitials : (
          <Icon
            icon={Icons.UserSolid}
            color={invert ? Colors.Grey1 : Colors.White}
            size={16}
          />
        )}
      </UserImageDiv>
    );
  }

  return (
    <UserImageDiv
      src={imageUrl}
      height={height}
      margin={margin}
      circle={circle}
    />
  );
}

export default UserImage;
