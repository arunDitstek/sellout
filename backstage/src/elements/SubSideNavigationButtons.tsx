import React from "react";
import styled from "styled-components";
import { rgba } from "polished";
import { Colors, Icon, Icons } from "@sellout/ui";
import { RolesEnum } from "@sellout/models/.dist/interfaces/IRole";
import usePermission from "../hooks/usePermission.hook";

const SideNavigationButtonsContainer = styled.div``;

type ButtonProps = {
  active: boolean;
};
const SideNavigationButton = styled.div<ButtonProps>`
  position: relative;
  height: 40px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${(props) => (props.active ? Colors.FadedOrange : null)};
  color: ${(props) => (props.active ? Colors.Orange : Colors.Grey2)};
  padding: 0 16px;
  margin: 0 0 4px;
  box-sizing: border-box;
  border-radius: 10px;
  transition: all 0.2s;

  &:hover {
    background-color: ${(props) => (props.active ? null : `${Colors.Grey6}`)};
    cursor: pointer;
  }
`;

const ButtonContent = styled.div`
  transition: all 0.2s;
  display: flex;
  align-items: center;
`;

const Text = styled.div<ButtonProps>`
  transition: all 0.2s;
  color: ${(props) => (props.active ? Colors.Orange : Colors.Grey2)};
  font-size: 1.4rem;
  font-weight: ${(props) => (props.active ? "600" : "500")};
  margin-left: 10px;
`;

const Line = styled.div`
  width: 100%;
  height: 1px;
  background: ${Colors.Grey5};
  margin: 16px 0px;
`;

const IconContainer = styled.div`
  width: 16px;
`;

type ButtonTypes = {
  icon?: any;
  activeIcon?: any;
  text?: string;
  onClick?: Function;
  active?: () => boolean | null;
  role?: RolesEnum;
  line?: boolean;
};

type PropTypes = {
  buttons: ButtonTypes[];
};

const SubSideNavigationButtons: React.FC<PropTypes> = ({ buttons }) => {
  const hasPermission = usePermission();

  const button = (b: any, i: number) => {
    if (b?.role && hasPermission && !hasPermission(b.role)) {
      return <div key={i} />;
    }

    if (b.line) {
      return <Line key={i} />;
    }

    const active = b.active();
    return (
      <React.Fragment key={i}>
        {!b?.cancel && (
          <SideNavigationButton
            active={active}
            onClick={() => b.onClick()}
            key={i}
          >
            <ButtonContent>
              <IconContainer>
                <Icon
                  icon={active ? b.activeIcon : b.icon}
                  size={14}
                  color={active ? Colors.Orange : Colors.Grey2}
                />
              </IconContainer>
              <Text active={active}>{b.text}</Text>
            </ButtonContent>
            {active && (
              <Icon
                icon={Icons.RightChevronRegular}
                size={14}
                color={Colors.Orange}
              />
            )}
          </SideNavigationButton>
        )}{" "}
      </React.Fragment>
    );
  };

  return (
    <SideNavigationButtonsContainer>
      {buttons?.map((b, i) => button(b, i))}
    </SideNavigationButtonsContainer>
  );
};

export default SubSideNavigationButtons;
