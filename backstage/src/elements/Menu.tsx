import React, { useState, useEffect, useRef } from "react";
import { usePopper } from "react-popper";
import styled, { keyframes, css } from "styled-components";
import { Colors, Icon } from "@sellout/ui";

const dropAndFadeIn = keyframes`
  from {
    opacity: 0;
    top: -20px;
    visibility: hidden;
  }

  to {
    opacity: 1;
    top: 0px;
    visibility: visible;
  }
`;

type ContainerProps = {
  visible: any;
  width?: string;
  margin?: string;
};

const DisplayContainer = styled.div<{ visible: boolean }>`
  display: ${(props) => (props.visible ? "block" : "none")};
`;

const MenuContainer = styled.div<ContainerProps>`
  visibility: ${(props) => (props.visible ? "visible" : "hidden")};
  display: flex;
  flex-direction: column;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  background: ${Colors.White};
  z-index: 1200;
  width: ${(props) => props.width || "274px"};
  animation: ${(props) =>
    props.visible
      ? css`
          ${dropAndFadeIn} 0.3s forwards
        `
      : null};
  margin: ${(props) => props.margin || "0px 10px 0 0"};
`;

type MenuItemProps = {
  justify?: string;
};
const MenuItem = styled.div<MenuItemProps>`
  display: flex;
  justify-content: ${(props) => props.justify || `flex-start`};
  padding: 10px 20px;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${Colors.Grey7};
  }
`;

type TextProps = {
  color?: string;
};
const MenuItemText = styled.div<TextProps>`
  color: ${(props) => props.color || `${Colors.Grey2}`};
  font-weight: 600;
  font-size: 1.2rem;
`;

type MenuItemsProps = {
  menuHead?: boolean;
};

const MenuItemsContainer = styled.div<MenuItemsProps>`
  margin: ${(props) =>
    props.menuHead ? "00px 0px 10px 0px" : "10px 0px 10px 0px"};
`;

const Space = styled.div`
  height: 10px;
`;

const IconContainer = styled.div`
  width: 20px;
  margin-right: 15px;
`;

const ImageContainer = styled.div`
  margin-right: 10px;
`;

export enum MenuEventTypes {
  Click = "click",
  MouseEnter = "mouseenter",
  MouseLeave = "mouseleave",
  MouseDown = "mousedown",
}

export enum PopperPlacementTypes {
  TopStart = "top-start",
  Top = "top",
  TopEnd = "top-end",
  RightStart = "right-start",
  Right = "right",
  RightEnd = "right-end",
  BottomStart = "bottom-start",
  Bottom = "bottom",
  BottomEnd = "bottom-end",
  LeftStart = "left-start",
  Left = "left",
  LeftEnd = "left-end",
}

type MenuProps = {
  menuHead?: React.ReactNode;
  openEvent: string;
  closeEvent: string;
  anchorElement: any;
  menuItems?: any[];
  width?: string;
  justify?: string;
  placement?: PopperPlacementTypes;
  margin?:string;
};

const Menu: React.FC<MenuProps> = ({
  menuHead,
  menuItems,
  openEvent,
  closeEvent,
  anchorElement,
  width,
  justify,
  margin,
  placement = PopperPlacementTypes.BottomEnd,
}) => {
  const [visible, setVisible] = useState<boolean>(false);
  const menuElement = useRef<any>(null);
  const { styles, attributes } = usePopper(
    anchorElement.current,
    menuElement.current,
    {
      placement,
      modifiers: [
        {
          name: "offset",
          options: {
            offset: [0, 0],
          },
        },
        {
          name: "preventOverflow",
          options: {
            padding: 0,
          },
        },
        {
          name: "flip",
          options: {
            fallbackPlacements: [PopperPlacementTypes.BottomEnd],
          },
        },
      ],
    }
  );

  const openMenu = () => {
    setVisible(true);
  };

  const closeMenu = () => {
    setVisible(false);
  };

  // TODO: add other event type listeners in useEffect and figure out
  // why this only closes on second click when you click on a side nav item with the menu open
  // if we put this in useEffect or useCallback, it only opens on second click..
  const handleExitClick = (event: MouseEvent) => {
    if (
      !anchorElement ||
      !anchorElement?.current?.contains(event.target) ||
      (anchorElement?.current?.contains(event.target) && visible)
    ) {
      closeMenu();
    }
  };

  useEffect(() => {
    const currentAnchor = anchorElement?.current;
    const currentMenu = menuElement?.current;
    currentAnchor?.addEventListener(openEvent, openMenu);

    if (closeEvent === MenuEventTypes.Click) {
      currentMenu?.addEventListener(closeEvent, closeMenu);
      document.addEventListener(MenuEventTypes.Click, handleExitClick);
    }

    if (closeEvent === MenuEventTypes.MouseLeave) {
      currentAnchor?.addEventListener(closeEvent, closeMenu);
      document
        ?.getElementById("CLOSE_MENU_ON_SCROLL_CONTAINER")
        ?.addEventListener("scroll", closeMenu);
    }

    return () => {
      currentAnchor?.removeEventListener(openEvent, openMenu);

      if (closeEvent === MenuEventTypes.Click) {
        currentMenu?.removeEventListener(closeEvent, closeMenu);
        document.removeEventListener(MenuEventTypes.Click, handleExitClick);
      }

      if (closeEvent === MenuEventTypes.MouseLeave) {
        currentAnchor?.removeEventListener(closeEvent, closeMenu);
        document
          ?.getElementById("CLOSE_MENU_ON_SCROLL_CONTAINER")
          ?.removeEventListener("scroll", closeMenu);
      }
    };
  }, [openEvent, closeEvent, anchorElement, menuElement, handleExitClick]);

  return (
    <MenuContainer
      ref={menuElement}
      style={styles.popper}
      {...attributes.popper}
      width={width}
      visible={visible}
      margin={margin}
    >
      <DisplayContainer visible={visible}>
        {menuHead}
        <MenuItemsContainer menuHead={Boolean(menuHead)}>
          {menuItems &&
            menuItems.map((item, index) => {
              if (item.space) return <Space key={index} />;
              return (
                <MenuItem
                  justify={justify}
                  key={index}
                  onClick={() => {
                    item.onClick();
                    closeMenu();
                  }}
                >
                  {item.image ? (
                    <ImageContainer>{item.image}</ImageContainer>
                  ) : item.icon ? (
                    <IconContainer>
                      <Icon icon={item.icon} color={Colors.Grey2} size={16} />
                    </IconContainer>
                  ) : null}
                  <MenuItemText color={item.color}>{item.text}</MenuItemText>
                </MenuItem>
              );
            })}
        </MenuItemsContainer>
      </DisplayContainer>
    </MenuContainer>
  );
};

export default Menu;
