import React, { useRef } from 'react';
import styled from 'styled-components';
import { Colors, Icon, Icons } from '@sellout/ui';
import { media } from '@sellout/ui/build/utils/MediaQuery';
import Label from '@sellout/ui/build/components/Label';
import Menu, { MenuEventTypes } from "../elements/Menu";
import { ModalTypes } from "../components/modal/Modal";
import { useDispatch } from 'react-redux';
import * as AppActions from "../redux/actions/app.actions";
import DELETE_SECONDARY_EMAIL from '@sellout/models/.dist/graphql/mutations/deleteSecondaryEmail.mutation';
import MAKE_PRIMARY_EMAIL from '@sellout/models/.dist/graphql/mutations/makeSecondaryToPrimaryEmail.mutation';
import { useMutation } from '@apollo/react-hooks';
import { AppNotificationTypeEnum } from '../models/interfaces/IAppNotification';

type ContainerPropTypes = {
  width?: string;
  margin?: string;
}

const Container = styled.div<ContainerPropTypes>`
  border: 1px solid ${Colors.Grey5};
  background: ${Colors.Grey7};
  border-radius: 10px;
  height: 40px;
  padding: 0px 15px;
  display: flex;
  align-items: center;
  width: ${props => props.width || 'auto'};
  font-weight: 500;
  color: ${Colors.Grey1};
  outline: none;
  transition: all 0.2s;
  margin: ${props => props.margin || 0};
  justify-content: space-between;

  ${media.mobile`
      font-size: 1.6rem;
    `};

    ${media.desktop`
      font-size: 1.4rem;
    `};
`;

const Item = styled.div`
  display: flex;
`;

/**
 * Not everything in this is used currently
 * due to design changes and secondary email
 * stuff not being finished. Should clean up
 */
type ImmutableSettingsInputProps = {
  text: string;
  width?: string;
  iconLeft?: any;
  label?: string;
  tip?: string;
  subLabel?: string;
  iconLeftColor?: string;
  withDropdown?: boolean;
  iconRight?: any;
  iconRightColor?: string;
  margin?: string;
  primary?: boolean;
}
const ImmutableSettingsInput: React.FC<ImmutableSettingsInputProps> = ({
  text,
  width,
  iconLeft,
  iconLeftColor,
  label,
  tip,
  subLabel,
  withDropdown,
  iconRight,
  iconRightColor,
  margin,
  primary,
}) => {
  const anchorElement = useRef<any>(null);
  const dispatch = useDispatch();
  const pushModal = (modalType: ModalTypes) =>
    dispatch(AppActions.pushModal(modalType));

  const menuItems: { text: string, onClick: Function, color?: string }[] = [];

  const email = text;
  const [deleteSecondaryEmail] = useMutation(DELETE_SECONDARY_EMAIL, {
    variables: {
      email,
    },
    onError(error) {
    },
    onCompleted(data) {
      dispatch(AppActions.showNotification(`Your secondary email address has been deleted.`, AppNotificationTypeEnum.Success));
    }
  });

  const [makePrimaryEmail] = useMutation(MAKE_PRIMARY_EMAIL, {
    variables: {
      email,
    },
    onError(error) {
    },
    onCompleted(data) {
      dispatch(AppActions.showNotification(`Your primary email address has been changed.`, AppNotificationTypeEnum.Success));
    }
  });

  if (!primary) {
    menuItems.push(
      {
        text: "Make primary",
        onClick: () => {
          makePrimaryEmail();
          console.log('Make primary')
        },
      },
      // {
      //   text: "Edit",
      //   onClick: () => pushModal(ModalTypes.ChangeEmail)
      // },
      {
        text: "Delete",
        onClick: () => {
          deleteSecondaryEmail();
          (console.log('Delete'))
        },
        color: Colors.Red,
      });
  } else {
    menuItems.push(
      {
        text: "Edit",
        onClick: () => pushModal(ModalTypes.ChangeEmail),
      },
    );
  }

  return (
    <>
      {label && <Label text={label} subText={subLabel} tip={tip} />}
      <Container margin={margin}>
        <Item>
          {iconLeft && (
            <Icon
              icon={iconLeft}
              color={iconLeftColor || Colors.Grey1}
              size={14}
              margin="0px 10px 0px 0px"
            />
          )}
          {text}
        </Item>
        {withDropdown
          ? (
            <Item ref={anchorElement} style={{ cursor: 'pointer' }}>
              <Icon
                icon={Icons.VerticalEllipsisRegular}
                color={Colors.Grey1}
                size={14}
              />
            </Item>)
          : (
            <Item>
              {iconRight && (
                <Icon
                  icon={iconRight}
                  color={iconRightColor || Colors.Green}
                  size={14}
                />
              )}
            </Item>)}
      </Container>
      {withDropdown && <Menu
        justify='flex-end'
        anchorElement={anchorElement}
        openEvent={MenuEventTypes.Click}
        closeEvent={MenuEventTypes.Click}
        menuItems={menuItems}
        width="fit-content"
      />}
    </>
  )
}

export default ImmutableSettingsInput;